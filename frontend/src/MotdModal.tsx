import { Textarea, Tooltip } from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/elements/Button.tsx';
import Stack from '@/elements/Stack.tsx';
import Text from '@/elements/Text.tsx';
import { Modal, ModalFooter } from '@/elements/modals/Modal.tsx';
import {
  MC_COLORS,
  MC_COLOR_NAMES,
  MC_FORMAT_NAMES,
  ampToSection,
  decodePropertiesValue,
  encodeMotdForProperties,
  sectionToAmp,
} from './properties.ts';

/** A run of characters sharing one style, produced by the legacy-code state machine */
interface StyledSegment {
  text: string;
  color: string | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  obfuscated: boolean;
}

/** Parse one line of &-coded text into styled segments (vanilla rules: a color code resets formatting) */
function parseAmpLine(line: string): StyledSegment[] {
  const segments: StyledSegment[] = [];
  let color: string | null = null;
  let bold = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;
  let obfuscated = false;
  let buffer = '';

  const flush = () => {
    if (buffer) {
      segments.push({ text: buffer, color, bold, italic, underline, strikethrough, obfuscated });
      buffer = '';
    }
  };

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = (line[i + 1] ?? '').toLowerCase();
    if ((ch === '&' || ch === '§') && next) {
      if (MC_COLORS[next]) {
        flush();
        color = MC_COLORS[next];
        bold = italic = underline = strikethrough = obfuscated = false;
        i++;
        continue;
      }
      if (next === 'r') {
        flush();
        color = null;
        bold = italic = underline = strikethrough = obfuscated = false;
        i++;
        continue;
      }
      if ('klmno'.includes(next)) {
        flush();
        if (next === 'k') obfuscated = true;
        else if (next === 'l') bold = true;
        else if (next === 'm') strikethrough = true;
        else if (next === 'n') underline = true;
        else if (next === 'o') italic = true;
        i++;
        continue;
      }
    }
    buffer += ch;
  }
  flush();
  return segments;
}

const OBFUSCATE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&?!';

function scramble(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += OBFUSCATE_CHARSET[Math.floor(Math.random() * OBFUSCATE_CHARSET.length)];
  }
  return out;
}

/** Server-list-style rendering of an &-coded MOTD (1-2 lines) */
export function MotdPreview({ ampText, className }: { ampText: string; className?: string }) {
  const lines = useMemo(() => ampText.split('\n').slice(0, 2).map(parseAmpLine), [ampText]);
  const hasObfuscated = lines.some((segs) => segs.some((s) => s.obfuscated));
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!hasObfuscated) return;
    const id = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, [hasObfuscated]);

  return (
    <div className={`sp-motd-preview ${className ?? ''}`}>
      {lines.map((segments, lineIdx) => (
        <div key={lineIdx} className='sp-motd-preview-line'>
          {segments.length === 0 ? ' ' : segments.map((seg, i) => (
            <span
              key={i}
              style={{
                color: seg.color ?? '#AAAAAA',
                fontWeight: seg.bold ? 700 : 400,
                fontStyle: seg.italic ? 'italic' : 'normal',
                textDecoration:
                  [seg.underline ? 'underline' : '', seg.strikethrough ? 'line-through' : '']
                    .filter(Boolean)
                    .join(' ') || 'none',
              }}
            >
              {seg.obfuscated ? scramble(seg.text.length) : seg.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

const COLOR_CODES = Object.keys(MC_COLORS);
const FORMAT_CODES = Object.keys(MC_FORMAT_NAMES);

export default function MotdModal({
  opened,
  onClose,
  rawValue,
  onSave,
}: {
  opened: boolean;
  onClose: () => void;
  rawValue: string;
  onSave: (raw: string) => void;
}) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // (Re)load from the raw properties value each time the modal opens
  useEffect(() => {
    if (opened) {
      setText(sectionToAmp(decodePropertiesValue(rawValue)));
    }
  }, [opened, rawValue]);

  const insertCode = (code: string) => {
    const el = inputRef.current;
    const token = `&${code}`;
    if (!el) {
      setText((t) => t + token);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? start;
    const updated = text.slice(0, start) + token + text.slice(end);
    setText(updated);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const handleChange = (value: string) => {
    // MOTD is at most 2 lines
    setText(value.split('\n').slice(0, 2).join('\n'));
  };

  const save = () => {
    onSave(encodeMotdForProperties(ampToSection(text)));
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title='Edit MOTD' size='lg'>
      <Stack gap='sm'>
        <Text size='xs' c='dimmed'>
          Use & followed by a code for colors and formatting (e.g. &6Gold &lBold). Press Enter for a
          second line. Codes are saved as proper section-sign escapes automatically.
        </Text>

        <div className='sp-motd-palette'>
          {COLOR_CODES.map((code) => (
            <Tooltip key={code} label={`${MC_COLOR_NAMES[code]} (&${code})`}>
              <button
                type='button'
                className='sp-motd-swatch'
                style={{ backgroundColor: MC_COLORS[code] }}
                onClick={() => insertCode(code)}
              />
            </Tooltip>
          ))}
        </div>
        <div className='sp-motd-palette'>
          {FORMAT_CODES.map((code) => (
            <Tooltip key={code} label={`&${code}`}>
              <button
                type='button'
                className={`sp-motd-format sp-motd-format--${code}`}
                onClick={() => insertCode(code)}
              >
                {MC_FORMAT_NAMES[code]}
              </button>
            </Tooltip>
          ))}
        </div>

        <Textarea
          ref={inputRef}
          value={text}
          onChange={(e) => handleChange(e.currentTarget.value)}
          placeholder='&6A &lMinecraft&r&6 Server'
          autosize
          minRows={2}
          maxRows={3}
          ff='monospace'
          data-autofocus
        />

        <div>
          <Text size='xs' c='dimmed' mb={4}>
            Preview
          </Text>
          <MotdPreview ampText={text} />
        </div>
      </Stack>
      <ModalFooter>
        <Button variant='subtle' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>Apply</Button>
      </ModalFooter>
    </Modal>
  );
}
