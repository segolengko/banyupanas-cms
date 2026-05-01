const privateIpv4Pattern =
  /^(127\.\d{1,3}\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/;

function normalizeHost(value: string) {
  return value.trim().toLowerCase();
}

function isLocalHttpHostname(hostname: string) {
  const normalized = normalizeHost(hostname);

  return normalized === 'localhost' || privateIpv4Pattern.test(normalized);
}

function sanitizeRelativeValue(value: string, allowRelative: boolean, allowHash: boolean) {
  if (allowHash && /^#[a-z0-9_-]+$/i.test(value)) {
    return value;
  }

  if (allowRelative && value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }

  return '';
}

function isAllowedHost(
  hostname: string,
  allowedHosts: string[] | undefined,
  allowedHostSuffixes: string[] | undefined,
) {
  const normalized = normalizeHost(hostname);

  if (!allowedHosts?.length && !allowedHostSuffixes?.length) {
    return true;
  }

  if (allowedHosts?.some((host) => normalizeHost(host) === normalized)) {
    return true;
  }

  return (
    allowedHostSuffixes?.some((suffix) => {
      const normalizedSuffix = normalizeHost(suffix);

      return normalized === normalizedSuffix || normalized.endsWith(`.${normalizedSuffix}`);
    }) || false
  );
}

export function sanitizeUrl(
  input: string,
  options: {
    allowRelative?: boolean;
    allowHash?: boolean;
    allowLocalHttp?: boolean;
    allowedHosts?: string[];
    allowedHostSuffixes?: string[];
  } = {},
) {
  const value = input.trim();

  if (!value) {
    return '';
  }

  const relativeValue = sanitizeRelativeValue(value, Boolean(options.allowRelative), Boolean(options.allowHash));

  if (relativeValue) {
    return relativeValue;
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return '';
  }

  const protocol = parsed.protocol.toLowerCase();
  const hostname = parsed.hostname.toLowerCase();
  const allowsLocalHttp = Boolean(options.allowLocalHttp);

  if (protocol === 'https:') {
    // allowed
  } else if (protocol === 'http:' && allowsLocalHttp && isLocalHttpHostname(hostname)) {
    // allowed for local previews only
  } else {
    return '';
  }

  if (!isAllowedHost(hostname, options.allowedHosts, options.allowedHostSuffixes)) {
    return '';
  }

  return parsed.toString();
}

export function sanitizeMediaAssetUrl(input: string) {
  return sanitizeUrl(input, {
    allowRelative: true,
    allowLocalHttp: true,
  });
}

export function sanitizePublicLinkUrl(input: string) {
  return sanitizeUrl(input, {
    allowRelative: true,
    allowHash: true,
    allowLocalHttp: true,
  });
}

export function sanitizeExternalProfileUrl(input: string) {
  return sanitizeUrl(input, {
    allowLocalHttp: true,
  });
}

export function sanitizeGoogleMapsPlaceUrl(input: string) {
  return sanitizeUrl(input, {
    allowedHosts: ['www.google.com', 'google.com', 'maps.google.com'],
  });
}

export function sanitizeGoogleMapsEmbedUrl(input: string) {
  const sanitized = sanitizeUrl(input, {
    allowedHosts: ['www.google.com', 'google.com', 'maps.google.com'],
  });

  if (!sanitized) {
    return '';
  }

  try {
    const parsed = new URL(sanitized);
    const path = parsed.pathname.toLowerCase();
    const output = parsed.searchParams.get('output')?.toLowerCase();

    if (output === 'embed' || path.startsWith('/maps/embed') || path.startsWith('/maps')) {
      return parsed.toString();
    }
  } catch {
    return '';
  }

  return '';
}
