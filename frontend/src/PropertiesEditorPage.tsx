import { faFloppyDisk, faRotateLeft, faSearch, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Badge,
  Group,
  Loader,
  NumberInput,
  SegmentedControl,
  Slider,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { axiosInstance } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import Select from '@/elements/input/Select.tsx';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  PROPERTY_MAP,
  type ParsedLine,
  type PropCategory,
  type PropMeta,
  parseServerProperties,
  serializeServerProperties,
} from './properties.ts';

type CategoryFilter = 'all' | PropCategory;

export default function PropertiesEditorPage() {
  const { addToast } = useToast();
  const { server } = useServerStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Original parsed file
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);
  // Current property values (working copy)
  const [values, setValues] = useState<Record<string, string>>({});
  // Original property values (to detect changes)
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});

  // UI state
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load server.properties on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosInstance
      .get(`/api/client/servers/${server.uuid}/files/contents`, {
        params: { file: '/server.properties' },
        responseType: 'text',
        transformResponse: [(data: string) => data],
      })
      .then(({ data }) => {
        const lines = parseServerProperties(data);
        setParsedLines(lines);

        const vals: Record<string, string> = {};
        for (const line of lines) {
          if (line.type === 'property' && line.key !== undefined) {
            vals[line.key] = line.value ?? '';
          }
        }
        setValues(vals);
        setOriginalValues({ ...vals });
      })
      .catch((err) => {
        const msg = err?.response?.status === 404
          ? 'server.properties not found. Make sure the server has been started at least once.'
          : `Failed to load server.properties: ${err.message}`;
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [server.uuid]);

  // Detect changed properties
  const changedKeys = useMemo(() => {
    const changed = new Set<string>();
    for (const [key, value] of Object.entries(values)) {
      if (originalValues[key] !== value) changed.add(key);
    }
    return changed;
  }, [values, originalValues]);

  const hasChanges = changedKeys.size > 0;

  // Build categorized properties for display
  const categorizedProperties = useMemo(() => {
    const result: Record<string, Array<{ key: string; value: string; meta: PropMeta | null }>> = {};

    // Initialize categories
    for (const cat of CATEGORY_ORDER) {
      result[cat] = [];
    }
    result['unknown'] = [];

    for (const [key, value] of Object.entries(values)) {
      const meta = PROPERTY_MAP[key] ?? null;
      const cat = meta?.category ?? 'unknown';
      if (!result[cat]) result[cat] = [];
      result[cat].push({ key, value, meta });
    }

    // Sort within each category: known properties first (by their order in PROPERTIES), then unknown alphabetically
    for (const entries of Object.values(result)) {
      entries.sort((a, b) => {
        if (a.meta && b.meta) return 0; // preserve natural order for known
        if (a.meta && !b.meta) return -1;
        if (!a.meta && b.meta) return 1;
        return a.key.localeCompare(b.key);
      });
    }

    return result;
  }, [values]);

  // Filter by category and search
  const visibleCategories = useMemo(() => {
    const cats: Array<{ id: string; label: string; entries: Array<{ key: string; value: string; meta: PropMeta | null }> }> = [];

    const filterCats = categoryFilter === 'all'
      ? [...CATEGORY_ORDER, 'unknown']
      : [categoryFilter];

    for (const catId of filterCats) {
      const entries = categorizedProperties[catId] ?? [];
      if (entries.length === 0) continue;

      const filtered = searchQuery
        ? entries.filter(({ key, meta }) => {
          const q = searchQuery.toLowerCase();
          return key.toLowerCase().includes(q)
            || (meta?.description ?? '').toLowerCase().includes(q);
        })
        : entries;

      if (filtered.length === 0) continue;

      const label = catId === 'unknown'
        ? 'Other / Unknown'
        : CATEGORY_LABELS[catId as PropCategory] ?? catId;

      cats.push({ id: catId, label, entries: filtered });
    }

    return cats;
  }, [categorizedProperties, categoryFilter, searchQuery]);

  const updateValue = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setValues({ ...originalValues });
  }, [originalValues]);

  const saveProperties = useCallback(async () => {
    setSaving(true);
    try {
      const changes: Record<string, string> = {};
      for (const key of changedKeys) {
        changes[key] = values[key];
      }

      const content = serializeServerProperties(parsedLines, changes);

      await axiosInstance.post(
        `/api/client/servers/${server.uuid}/files/write`,
        content,
        {
          params: { file: '/server.properties' },
          headers: { 'Content-Type': 'text/plain' },
        },
      );

      setOriginalValues({ ...values });
      // Re-parse to update the parsed lines with changes
      setParsedLines(parseServerProperties(content));

      addToast(
        server.status === 'running' || server.status === 'starting'
          ? 'Properties saved! Restart your server to apply changes.'
          : 'Properties saved successfully!',
        'success',
      );
    } catch (err) {
      addToast(`Failed to save: ${err instanceof Error ? err.message : 'unknown error'}`, 'error');
    } finally {
      setSaving(false);
    }
  }, [changedKeys, values, parsedLines, server.uuid, server.status]);

  // Category filter options
  const categoryOptions = useMemo(() => {
    const opts = [{ value: 'all', label: 'All' }];
    for (const cat of CATEGORY_ORDER) {
      const entries = categorizedProperties[cat];
      if (entries && entries.length > 0) {
        opts.push({ value: cat, label: CATEGORY_LABELS[cat] });
      }
    }
    if ((categorizedProperties['unknown'] ?? []).length > 0) {
      opts.push({ value: 'unknown', label: 'Other' });
    }
    return opts;
  }, [categorizedProperties]);

  const isRunning = server.status === 'running' || server.status === 'starting';

  return (
    <ServerContentContainer title='Server Properties'>
      <div className='sp-editor'>
        {/* Header */}
        <div className='sp-header'>
          <Title order={3}>server.properties</Title>
          <Group gap='sm'>
            {hasChanges && (
              <Badge color='yellow' variant='light'>
                {changedKeys.size} unsaved {changedKeys.size === 1 ? 'change' : 'changes'}
              </Badge>
            )}
            <Button
              variant='subtle'
              onClick={resetAll}
              disabled={!hasChanges}
              leftSection={<FontAwesomeIcon icon={faRotateLeft} />}
            >
              Reset
            </Button>
            <Button
              onClick={saveProperties}
              loading={saving}
              disabled={!hasChanges}
              leftSection={<FontAwesomeIcon icon={faFloppyDisk} />}
            >
              Save
            </Button>
          </Group>
        </div>

        {/* Running warning */}
        {isRunning && (
          <Alert icon={<FontAwesomeIcon icon={faTriangleExclamation} />} color='yellow' variant='light' mt='sm'>
            Server is running. Changes will take effect after a restart.
          </Alert>
        )}

        {/* Loading / Error */}
        {loading ? (
          <div className='sp-center'><Loader color='violet' size='lg' /></div>
        ) : error ? (
          <Alert color='red' variant='light' mt='md'>{error}</Alert>
        ) : (
          <>
            {/* Filters */}
            <div className='sp-filters'>
              <SegmentedControl
                value={categoryFilter}
                onChange={(v) => setCategoryFilter(v as CategoryFilter)}
                data={categoryOptions}
                className='sp-category-tabs'
              />
              <TextInput
                placeholder='Search properties...'
                leftSection={<FontAwesomeIcon icon={faSearch} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                className='sp-search'
              />
            </div>

            {/* Properties */}
            {visibleCategories.length === 0 ? (
              <Text c='dimmed' ta='center' mt='xl'>No properties match your search.</Text>
            ) : (
              <Stack gap='lg' mt='md'>
                {visibleCategories.map(({ id, label, entries }) => (
                  <div key={id} className='sp-category'>
                    <Title order={5} className='sp-category-title'>{label}</Title>
                    <div className='sp-property-list'>
                      {entries.map(({ key, value, meta }) => (
                        <PropertyRow
                          key={key}
                          propKey={key}
                          value={value}
                          meta={meta}
                          changed={changedKeys.has(key)}
                          onChange={updateValue}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </Stack>
            )}
          </>
        )}
      </div>
    </ServerContentContainer>
  );
}

function PropertyRow({
  propKey,
  value,
  meta,
  changed,
  onChange,
}: {
  propKey: string;
  value: string;
  meta: PropMeta | null;
  changed: boolean;
  onChange: (key: string, value: string) => void;
}) {
  const isRemoved = !!meta?.removed;

  return (
    <div className={`sp-property ${changed ? 'sp-property--changed' : ''}`}>
      <div className='sp-property-header'>
        <div className='sp-property-key-row'>
          <Text fw={600} size='sm' ff='monospace' className='sp-property-key'>{propKey}</Text>
          {meta?.since && !isRemoved && (
            <span className='sp-tag sp-tag--gray'>{meta.since}+</span>
          )}
          {isRemoved && (
            <Tooltip label={meta.replacedBy ? `Replaced by: ${meta.replacedBy}` : `Removed in ${meta.removed}`}>
              <span className='sp-tag sp-tag--red'>REMOVED {meta.removed}</span>
            </Tooltip>
          )}
          {meta?.sensitive && (
            <span className='sp-tag sp-tag--yellow'>SENSITIVE</span>
          )}
          {changed && (
            <span className='sp-tag sp-tag--blue'>MODIFIED</span>
          )}
        </div>
        {meta?.description && (
          <Text size='xs' c='dimmed' className='sp-property-desc'>{meta.description}</Text>
        )}
      </div>
      <div className='sp-property-input'>
        <PropertyInput propKey={propKey} value={value} meta={meta} onChange={onChange} />
      </div>
    </div>
  );
}

function PropertyInput({
  propKey,
  value,
  meta,
  onChange,
}: {
  propKey: string;
  value: string;
  meta: PropMeta | null;
  onChange: (key: string, value: string) => void;
}) {
  if (!meta) {
    return (
      <TextInput
        value={value}
        onChange={(e) => onChange(propKey, e.currentTarget.value)}
        placeholder='value'
        ff='monospace'
        size='sm'
      />
    );
  }

  switch (meta.type) {
    case 'boolean':
      return (
        <Switch
          checked={value === 'true'}
          onChange={(e) => onChange(propKey, e.currentTarget.checked ? 'true' : 'false')}
          label={value === 'true' ? 'true' : 'false'}
          size='sm'
        />
      );

    case 'enum':
      return (
        <Select
          data={(meta.options ?? []).map((opt) => ({ value: opt, label: opt }))}
          value={value}
          onChange={(v) => v !== null && onChange(propKey, v)}
          size='sm'
        />
      );

    case 'integer': {
      // Use slider for view-distance and simulation-distance
      const useSlider = (propKey === 'view-distance' || propKey === 'simulation-distance')
        && meta.min !== undefined && meta.max !== undefined;

      if (useSlider) {
        return (
          <Group gap='sm' w='100%'>
            <Slider
              value={parseInt(value) || meta.min || 0}
              onChange={(v) => onChange(propKey, String(v))}
              min={meta.min}
              max={meta.max}
              step={1}
              label={(v) => `${v} chunks`}
              className='sp-slider'
            />
            <Text size='sm' fw={500} ff='monospace' w={40} ta='center'>
              {value}
            </Text>
          </Group>
        );
      }

      return (
        <NumberInput
          value={value === '' ? '' : parseInt(value)}
          onChange={(v) => onChange(propKey, String(v))}
          min={meta.min}
          max={meta.max}
          size='sm'
          ff='monospace'
        />
      );
    }

    case 'text':
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(propKey, e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={6}
          size='sm'
          ff='monospace'
        />
      );

    default:
      return (
        <TextInput
          value={value}
          onChange={(e) => onChange(propKey, e.currentTarget.value)}
          placeholder={meta.default || ''}
          size='sm'
          ff='monospace'
          type={meta.sensitive ? 'password' : 'text'}
        />
      );
  }
}
