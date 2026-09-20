const API_ENDPOINT = 'https://api.mymemory.translated.net/get';

export class TranslationError extends Error {
  constructor(message: string, public readonly kind: 'network' | 'empty' | 'api' | 'limit' = 'api') {
    super(message);
    this.name = 'TranslationError';
  }
}

export type TranslationResult = {
  text: string;
  match?: number;
  source: 'en' | string;
  target: 'te' | string;
};

type MyMemoryResponse = {
  responseStatus: number;
  responseDetails?: string;
  responseData?: {
    translatedText?: string;
    match?: number;
  };
  matches?: Array<{
    translation?: string;
    quality?: number;
  }>;
};

export async function translateText(
  text: string,
  source: string,
  target: string,
): Promise<TranslationResult> {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new TranslationError('Please enter some text to translate.', 'empty');
  }

  if (source === target) {
    throw new TranslationError('Source and target languages must be different.', 'api');
  }

  if (trimmed.length > 500) {
    throw new TranslationError(
      'Text is too long for the free translation API. Please limit to 500 characters.',
      'api',
    );
  }

  const params = new URLSearchParams({
    q: trimmed,
    langpair: `${source}|${target}`,
  });

  const url = `${API_ENDPOINT}?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new TranslationError(
      'Could not reach the translation service. Please check your internet connection and try again.',
      'network',
    );
  }

  if (!res.ok) {
    throw new TranslationError(
      `The translation service responded with an error (status ${res.status}). Please try again in a moment.`,
      'network',
    );
  }

  let data: MyMemoryResponse;
  try {
    data = (await res.json()) as MyMemoryResponse;
  } catch {
    throw new TranslationError('Received an unreadable response from the translation service.', 'api');
  }

  // MyMemory returns 403/429 style info in responseDetails for quota limits
  const details = (data.responseDetails ?? '').toLowerCase();
  if (details.includes('limit') || details.includes('quota') || data.responseStatus === 429) {
    throw new TranslationError(
      'The daily limit for the free translation service has been reached. Please try again tomorrow.',
      'limit',
    );
  }

  const translated = (data.responseData?.translatedText ?? '').trim();

  if (!translated || translated === trimmed) {
    throw new TranslationError(
      'No translation could be produced for this text. Try rephrasing or using a different language pair.',
      'api',
    );
  }

  return {
    text: translated,
    match: data.responseData?.match,
    source,
    target,
  };
}
