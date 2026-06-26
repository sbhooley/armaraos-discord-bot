const SCAM_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bfree\s+ainl\b/i, label: 'fake AINL airdrop' },
  { re: /\bairdrop\b.*\bainl\b/i, label: 'airdrop scam' },
  { re: /\bclaim\s+(your|free)\s+(tokens?|ainl)\b/i, label: 'token claim scam' },
  { re: /\bsupport\s+(team|staff)\s+(will|dm)\s+you\b/i, label: 'fake support DM' },
  { re: /\bseed\s+phrase\b/i, label: 'seed phrase phishing' },
  { re: /\bconnect\s+wallet\b/i, label: 'wallet connect bait' },
  { re: /discord\.gift/i, label: 'discord gift scam' },
  { re: /nitro\.free|free-nitro/i, label: 'nitro scam' },
  { re: /(?:https?:\/\/)?(?:bit\.ly|tinyurl|t\.co)\/\S+/i, label: 'suspicious short link' },
];

export interface ScamScanResult {
  flagged: boolean;
  reasons: string[];
}

export function scanForScam(content: string): ScamScanResult {
  const reasons: string[] = [];
  for (const { re, label } of SCAM_PATTERNS) {
    if (re.test(content)) reasons.push(label);
  }
  return { flagged: reasons.length > 0, reasons };
}
