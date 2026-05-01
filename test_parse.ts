function parseAddress(address: string): [string, string, string] {
  if (!address || typeof address !== 'string') {
    throw new Error('Adresse manquante ou invalide');
  }

  // Format avec virgules : "rue, code postal, ville"
  const commaParts = address.split(',').map((p) => p.trim());
  if (commaParts.length >= 3) {
    return [commaParts[0], commaParts[1], commaParts[2]];
  }

  // Format standard français : "12 Rue Lecourbe 75015 Paris"
  const postalCodeMatch = address.match(/^(.+?)\s+(\d{5})\s+(.+)$/);
  if (postalCodeMatch) {
    const [, street, postalCode, city] = postalCodeMatch;
    return [street.trim(), postalCode, city.trim()];
  }

  throw new Error(`Adresse invalide: ${address}`);
}

console.log(parseAddress("12 Rue Lecourbe 75015 Paris"));
console.log(parseAddress("12 Rue Lecourbe, 75015, Paris"));
