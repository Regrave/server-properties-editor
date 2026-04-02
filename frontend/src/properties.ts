/** Input type for a property */
export type PropType = 'boolean' | 'integer' | 'string' | 'enum' | 'text';

/** Category grouping for display */
export type PropCategory =
  | 'general'
  | 'world'
  | 'network'
  | 'performance'
  | 'security'
  | 'resource_pack'
  | 'rcon_query'
  | 'players'
  | 'management';

export const CATEGORY_LABELS: Record<PropCategory, string> = {
  general: 'General',
  world: 'World',
  network: 'Network',
  performance: 'Performance',
  security: 'Security',
  resource_pack: 'Resource Pack',
  rcon_query: 'RCON & Query',
  players: 'Players',
  management: 'Management Server',
};

export const CATEGORY_ORDER: PropCategory[] = [
  'general',
  'world',
  'players',
  'performance',
  'network',
  'security',
  'resource_pack',
  'rcon_query',
  'management',
];

export interface PropMeta {
  key: string;
  type: PropType;
  default: string;
  description: string;
  category: PropCategory;
  /** For enum type: valid options */
  options?: string[];
  /** For integer type: minimum value */
  min?: number;
  /** For integer type: maximum value */
  max?: number;
  /** Minecraft version this was added in (for display) */
  since?: string;
  /** Minecraft version this was removed in */
  removed?: string;
  /** If removed, what replaced it */
  replacedBy?: string;
  /** Whether this is a sensitive field (passwords) */
  sensitive?: boolean;
}

/**
 * Complete metadata for all known Java Edition server.properties fields.
 * Includes current, legacy, and removed properties so any file can be understood.
 */
export const PROPERTIES: PropMeta[] = [
  // ─── General ───────────────────────────────────────────────
  {
    key: 'motd',
    type: 'string',
    default: 'A Minecraft Server',
    description: 'Message displayed in the server list below the server name. Supports color codes with the section sign.',
    category: 'general',
  },
  {
    key: 'difficulty',
    type: 'enum',
    default: 'easy',
    description: 'Sets the difficulty level of the game. Affects mob damage, hunger drain, and other mechanics.',
    category: 'general',
    options: ['peaceful', 'easy', 'normal', 'hard'],
  },
  {
    key: 'gamemode',
    type: 'enum',
    default: 'survival',
    description: 'Default game mode for new players joining the server.',
    category: 'general',
    options: ['survival', 'creative', 'adventure', 'spectator'],
  },
  {
    key: 'hardcore',
    type: 'boolean',
    default: 'false',
    description: 'Enables hardcore mode. Players are set to spectator on death and difficulty is locked to hard.',
    category: 'general',
  },
  {
    key: 'max-players',
    type: 'integer',
    default: '20',
    description: 'Maximum number of players that can be connected to the server at the same time.',
    category: 'general',
    min: 0,
    max: 2147483647,
  },
  {
    key: 'enable-status',
    type: 'boolean',
    default: 'true',
    description: 'Whether the server appears as online in the server list. When false, clients cannot see the server status.',
    category: 'general',
    since: '1.16',
  },
  {
    key: 'hide-online-players',
    type: 'boolean',
    default: 'false',
    description: 'Hides the player list from the server status response. Players will not see who is online.',
    category: 'general',
    since: '1.18',
  },
  {
    key: 'bug-report-link',
    type: 'string',
    default: '',
    description: 'URL for a custom bug report link shown to players. Leave blank to use the default Minecraft bug report.',
    category: 'general',
    since: '1.21',
  },

  // ─── World ─────────────────────────────────────────────────
  {
    key: 'level-name',
    type: 'string',
    default: 'world',
    description: 'Name of the world directory. This determines which folder the world data is stored in.',
    category: 'world',
  },
  {
    key: 'level-seed',
    type: 'string',
    default: '',
    description: 'Seed for world generation. Leave blank for a random seed. Can be any string or number.',
    category: 'world',
  },
  {
    key: 'level-type',
    type: 'enum',
    default: 'minecraft\\:normal',
    description: 'World type preset for terrain generation.',
    category: 'world',
    options: ['minecraft\\:normal', 'minecraft\\:flat', 'minecraft\\:large_biomes', 'minecraft\\:amplified', 'minecraft\\:single_biome_surface'],
    since: '1.1',
  },
  {
    key: 'generate-structures',
    type: 'boolean',
    default: 'true',
    description: 'Whether structures like villages, temples, and strongholds generate in new chunks.',
    category: 'world',
  },
  {
    key: 'generator-settings',
    type: 'text',
    default: '{}',
    description: 'JSON settings for customizing world generation. Used with flat worlds to define layers and features.',
    category: 'world',
    since: '1.8',
  },
  {
    key: 'max-world-size',
    type: 'integer',
    default: '29999984',
    description: 'Maximum distance from world center that players can travel. Sets the world border radius.',
    category: 'world',
    min: 1,
    max: 29999984,
  },
  {
    key: 'spawn-protection',
    type: 'integer',
    default: '16',
    description: 'Radius around spawn point where non-ops cannot build or break blocks. Set to 0 to disable.',
    category: 'world',
    min: 0,
    since: '1.4.2',
  },
  {
    key: 'initial-enabled-packs',
    type: 'string',
    default: 'vanilla',
    description: 'Comma-separated list of datapacks to enable on world creation.',
    category: 'world',
    since: '1.19.3',
  },
  {
    key: 'initial-disabled-packs',
    type: 'string',
    default: '',
    description: 'Comma-separated list of datapacks to not auto-enable on world creation.',
    category: 'world',
    since: '1.19.3',
  },

  // ─── Players ───────────────────────────────────────────────
  {
    key: 'allow-flight',
    type: 'boolean',
    default: 'false',
    description: 'Allows players to use flight in Survival mode with mods. When false, hovering players are kicked.',
    category: 'players',
  },
  {
    key: 'force-gamemode',
    type: 'boolean',
    default: 'false',
    description: 'Forces players to join in the default game mode every time they connect.',
    category: 'players',
  },
  {
    key: 'player-idle-timeout',
    type: 'integer',
    default: '0',
    description: 'Kicks idle players after this many minutes. Set to 0 to disable.',
    category: 'players',
    min: 0,
  },
  {
    key: 'op-permission-level',
    type: 'enum',
    default: '4',
    description: 'Default permission level for server operators. Level 1: bypass spawn protection. Level 2: use cheat commands. Level 3: manage players. Level 4: manage server.',
    category: 'players',
    options: ['1', '2', '3', '4'],
  },
  {
    key: 'function-permission-level',
    type: 'enum',
    default: '2',
    description: 'Permission level that functions execute at by default.',
    category: 'players',
    options: ['1', '2', '3', '4'],
    since: '1.14.4',
  },
  {
    key: 'broadcast-console-to-ops',
    type: 'boolean',
    default: 'true',
    description: 'Sends server console output messages to all online operators.',
    category: 'players',
  },
  {
    key: 'broadcast-rcon-to-ops',
    type: 'boolean',
    default: 'true',
    description: 'Sends RCON console output messages to all online operators.',
    category: 'players',
  },
  {
    key: 'accepts-transfers',
    type: 'boolean',
    default: 'false',
    description: 'Whether the server accepts incoming player transfers from other servers via the transfer packet.',
    category: 'players',
  },
  {
    key: 'pause-when-empty-seconds',
    type: 'integer',
    default: '60',
    description: 'Pauses the server after this many seconds with no players online. Set to 0 or negative to disable.',
    category: 'players',
    since: '1.21.2',
  },

  // ─── Performance ───────────────────────────────────────────
  {
    key: 'view-distance',
    type: 'integer',
    default: '10',
    description: 'Server-side view distance in chunks. Higher values use more resources but let players see further.',
    category: 'performance',
    min: 3,
    max: 32,
  },
  {
    key: 'simulation-distance',
    type: 'integer',
    default: '10',
    description: 'Distance in chunks from the player where entities and game mechanics are simulated.',
    category: 'performance',
    min: 3,
    max: 32,
    since: '1.18',
  },
  {
    key: 'max-tick-time',
    type: 'integer',
    default: '60000',
    description: 'Maximum time in milliseconds a single server tick can take before the watchdog kills the server. Set to -1 to disable.',
    category: 'performance',
    min: -1,
  },
  {
    key: 'entity-broadcast-range-percentage',
    type: 'integer',
    default: '100',
    description: 'Percentage of the default entity render distance. Lower values reduce bandwidth but hide entities sooner.',
    category: 'performance',
    min: 10,
    max: 1000,
    since: '1.16',
  },
  {
    key: 'sync-chunk-writes',
    type: 'boolean',
    default: 'true',
    description: 'Enables synchronous chunk writing. Safer but may impact performance with HDDs.',
    category: 'performance',
    since: '1.16',
  },
  {
    key: 'max-chained-neighbor-updates',
    type: 'integer',
    default: '1000000',
    description: 'Limits consecutive neighbor block updates before skipping. Prevents lag from large redstone circuits. Set negative to disable.',
    category: 'performance',
    since: '1.19',
  },
  {
    key: 'region-file-compression',
    type: 'enum',
    default: 'deflate',
    description: 'Compression algorithm for region files. LZ4 is faster but uses more disk space.',
    category: 'performance',
    options: ['deflate', 'lz4', 'none'],
    since: '1.20.5',
  },
  {
    key: 'use-native-transport',
    type: 'boolean',
    default: 'true',
    description: 'Uses optimized packet handling on Linux. Disable if experiencing connection issues.',
    category: 'performance',
  },
  {
    key: 'enable-jmx-monitoring',
    type: 'boolean',
    default: 'false',
    description: 'Exposes a JMX MBean with server tick time metrics for monitoring tools.',
    category: 'performance',
  },

  // ─── Network ───────────────────────────────────────────────
  {
    key: 'server-ip',
    type: 'string',
    default: '',
    description: 'IP address the server listens on. Leave blank to listen on all available interfaces.',
    category: 'network',
  },
  {
    key: 'server-port',
    type: 'integer',
    default: '25565',
    description: 'TCP port the server listens on for incoming connections.',
    category: 'network',
    min: 1,
    max: 65534,
  },
  {
    key: 'network-compression-threshold',
    type: 'integer',
    default: '256',
    description: 'Minimum packet size in bytes before compression is applied. Set to -1 to disable, 0 to compress everything.',
    category: 'network',
    min: -1,
    since: '1.8',
  },
  {
    key: 'rate-limit',
    type: 'integer',
    default: '0',
    description: 'Maximum number of packets a client can send per second before being kicked. 0 disables the limit.',
    category: 'network',
    min: 0,
    since: '1.16.2',
  },
  {
    key: 'online-mode',
    type: 'boolean',
    default: 'true',
    description: 'Verifies connecting players against the Minecraft account database. Disable only for offline/LAN servers.',
    category: 'network',
  },

  // ─── Security ──────────────────────────────────────────────
  {
    key: 'white-list',
    type: 'boolean',
    default: 'false',
    description: 'Enables the whitelist. Only players in whitelist.json can connect.',
    category: 'security',
  },
  {
    key: 'enforce-whitelist',
    type: 'boolean',
    default: 'false',
    description: 'When the whitelist is reloaded, kicks any connected players not on the list.',
    category: 'security',
  },
  {
    key: 'enforce-secure-profile',
    type: 'boolean',
    default: 'true',
    description: 'Requires players to have a Mojang-signed public key to join. Prevents unsigned chat messages.',
    category: 'security',
    since: '1.19',
  },
  {
    key: 'prevent-proxy-connections',
    type: 'boolean',
    default: 'false',
    description: 'Kicks players whose ISP/AS number differs from their authentication. Helps prevent VPN/proxy usage.',
    category: 'security',
    since: '1.11',
  },
  {
    key: 'log-ips',
    type: 'boolean',
    default: 'true',
    description: 'Whether client IP addresses are logged in the server console and log files.',
    category: 'security',
    since: '1.20.2',
  },
  {
    key: 'text-filtering-config',
    type: 'string',
    default: '',
    description: 'Configuration for server-side chat text filtering.',
    category: 'security',
    since: '1.16.4',
  },
  {
    key: 'text-filtering-version',
    type: 'enum',
    default: '0',
    description: 'Text filtering configuration format version.',
    category: 'security',
    options: ['0', '1'],
    since: '1.21.2',
  },
  {
    key: 'enable-code-of-conduct',
    type: 'boolean',
    default: 'false',
    description: 'Looks for code of conduct files in the codeofconduct subfolder.',
    category: 'security',
    since: '1.21.9',
  },

  // ─── Resource Pack ─────────────────────────────────────────
  {
    key: 'resource-pack',
    type: 'string',
    default: '',
    description: 'URL to a resource pack that clients are prompted to download. Must be a direct download link.',
    category: 'resource_pack',
  },
  {
    key: 'resource-pack-sha1',
    type: 'string',
    default: '',
    description: 'SHA-1 hash of the resource pack file for verification. Use lowercase hex characters.',
    category: 'resource_pack',
  },
  {
    key: 'resource-pack-id',
    type: 'string',
    default: '',
    description: 'UUID to identify the resource pack. Auto-generated from the URL if blank.',
    category: 'resource_pack',
    since: '1.20.3',
  },
  {
    key: 'resource-pack-prompt',
    type: 'string',
    default: '',
    description: 'Custom message shown when prompting players to download the resource pack. Supports chat component JSON.',
    category: 'resource_pack',
    since: '1.17',
  },
  {
    key: 'require-resource-pack',
    type: 'boolean',
    default: 'false',
    description: 'Disconnects players who decline the resource pack.',
    category: 'resource_pack',
    since: '1.17',
  },

  // ─── RCON & Query ──────────────────────────────────────────
  {
    key: 'enable-rcon',
    type: 'boolean',
    default: 'false',
    description: 'Enables remote console (RCON) access for sending commands remotely.',
    category: 'rcon_query',
  },
  {
    key: 'rcon.port',
    type: 'integer',
    default: '25575',
    description: 'TCP port for RCON connections.',
    category: 'rcon_query',
    min: 1,
    max: 65534,
  },
  {
    key: 'rcon.password',
    type: 'string',
    default: '',
    description: 'Password required to authenticate RCON connections. Leave blank to disable RCON authentication.',
    category: 'rcon_query',
    sensitive: true,
  },
  {
    key: 'enable-query',
    type: 'boolean',
    default: 'false',
    description: 'Enables the GameSpy4 query protocol for retrieving server information via UDP.',
    category: 'rcon_query',
  },
  {
    key: 'query.port',
    type: 'integer',
    default: '25565',
    description: 'UDP port for the query protocol.',
    category: 'rcon_query',
    min: 1,
    max: 65534,
  },

  // ─── Management Server (1.21.9+) ──────────────────────────
  {
    key: 'management-server-enabled',
    type: 'boolean',
    default: 'false',
    description: 'Enables the Server Management Protocol for external management tools.',
    category: 'management',
    since: '1.21.9',
  },
  {
    key: 'management-server-host',
    type: 'string',
    default: 'localhost',
    description: 'Hostname or IP the management server binds to.',
    category: 'management',
    since: '1.21.9',
  },
  {
    key: 'management-server-port',
    type: 'integer',
    default: '0',
    description: 'Port for the management server. 0 for auto-select.',
    category: 'management',
    min: 0,
    max: 65534,
    since: '1.21.9',
  },
  {
    key: 'management-server-allowed-origins',
    type: 'string',
    default: '',
    description: 'Comma-separated list of allowed origins for management protocol connections.',
    category: 'management',
    since: '1.21.9',
  },
  {
    key: 'management-server-secret',
    type: 'string',
    default: '',
    description: 'Client authorization secret for the management protocol. Auto-generated if blank.',
    category: 'management',
    sensitive: true,
    since: '1.21.9',
  },
  {
    key: 'management-server-tls-enabled',
    type: 'boolean',
    default: 'true',
    description: 'Use TLS encryption for the management protocol.',
    category: 'management',
    since: '1.21.9',
  },
  {
    key: 'management-server-tls-keystore',
    type: 'string',
    default: '',
    description: 'Path to the TLS keystore file for the management server.',
    category: 'management',
    since: '1.21.9',
  },
  {
    key: 'management-server-tls-keystore-password',
    type: 'string',
    default: '',
    description: 'Password for the TLS keystore file.',
    category: 'management',
    sensitive: true,
    since: '1.21.9',
  },
  {
    key: 'status-heartbeat-interval',
    type: 'integer',
    default: '0',
    description: 'Interval in milliseconds for management server heartbeat messages. 0 to disable.',
    category: 'management',
    min: 0,
    since: '1.21.9',
  },

  // ─── Removed Properties (still shown if present in file) ──
  {
    key: 'pvp',
    type: 'boolean',
    default: 'true',
    description: 'Whether players can deal damage to each other.',
    category: 'players',
    removed: '1.21.9',
    replacedBy: 'Controlled via game rule',
  },
  {
    key: 'allow-nether',
    type: 'boolean',
    default: 'true',
    description: 'Whether players can travel to the Nether dimension.',
    category: 'world',
    removed: '1.21.9',
  },
  {
    key: 'spawn-animals',
    type: 'boolean',
    default: 'true',
    description: 'Whether animals can spawn naturally in the world.',
    category: 'world',
    removed: '1.21.2',
  },
  {
    key: 'spawn-monsters',
    type: 'boolean',
    default: 'true',
    description: 'Whether hostile mobs can spawn naturally in the world.',
    category: 'world',
    removed: '1.21.9',
  },
  {
    key: 'spawn-npcs',
    type: 'boolean',
    default: 'true',
    description: 'Whether villagers can spawn in the world.',
    category: 'world',
    removed: '1.21.2',
  },
  {
    key: 'enable-command-block',
    type: 'boolean',
    default: 'false',
    description: 'Whether command blocks are enabled on the server.',
    category: 'general',
    removed: '1.21.9',
  },
  {
    key: 'max-build-height',
    type: 'integer',
    default: '256',
    description: 'Maximum height that players can build at.',
    category: 'world',
    min: 1,
    removed: '1.17',
  },
  {
    key: 'snooper-enabled',
    type: 'boolean',
    default: 'true',
    description: 'Whether the server sends snoop data to Mojang for analytics.',
    category: 'general',
    removed: '1.18',
  },
  {
    key: 'announce-player-achievements',
    type: 'boolean',
    default: 'true',
    description: 'Whether player achievements are announced in chat.',
    category: 'players',
    removed: '1.12',
    replacedBy: 'gamerule announceAdvancements',
  },
  {
    key: 'texture-pack',
    type: 'string',
    default: '',
    description: 'URL to a texture pack for clients to download.',
    category: 'resource_pack',
    removed: '1.0',
    replacedBy: 'resource-pack',
  },
];

/** Build a lookup map from property key to metadata */
export const PROPERTY_MAP: Record<string, PropMeta> = {};
for (const prop of PROPERTIES) {
  PROPERTY_MAP[prop.key] = prop;
}

/**
 * Parse a server.properties file into key-value pairs.
 * Preserves ordering and comments.
 */
export interface ParsedLine {
  type: 'comment' | 'property' | 'blank';
  raw: string;
  key?: string;
  value?: string;
}

export function parseServerProperties(content: string): ParsedLine[] {
  const lines: ParsedLine[] = [];
  for (const raw of content.split('\n')) {
    const trimmed = raw.trim();
    if (trimmed === '') {
      lines.push({ type: 'blank', raw });
    } else if (trimmed.startsWith('#')) {
      lines.push({ type: 'comment', raw });
    } else {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) {
        lines.push({ type: 'comment', raw });
      } else {
        const key = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        lines.push({ type: 'property', raw, key, value });
      }
    }
  }
  return lines;
}

/**
 * Serialize parsed lines back into a server.properties string.
 */
export function serializeServerProperties(
  lines: ParsedLine[],
  changes: Record<string, string>,
): string {
  const used = new Set<string>();
  const output: string[] = [];

  for (const line of lines) {
    if (line.type === 'property' && line.key !== undefined) {
      const key = line.key;
      used.add(key);
      const newValue = key in changes ? changes[key] : line.value;
      output.push(`${key}=${newValue ?? ''}`);
    } else {
      output.push(line.raw);
    }
  }

  // Append any new properties not originally in the file
  for (const [key, value] of Object.entries(changes)) {
    if (!used.has(key)) {
      output.push(`${key}=${value}`);
    }
  }

  return output.join('\n');
}
