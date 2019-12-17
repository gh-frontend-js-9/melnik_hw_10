async function getExchangeRate(fromCurrency, toCurrency) {
  try {
    const response = await axios.get('http://www.apilayer.net/api/live?access_key=e21f00c9381b919cbe03c7bb7d67f0d2&format=1');
    const rate = response.data.quotes;
    const usd = 1 / rate['USD' + fromCurrency];
    const exchangeRate = usd * rate['USD' + toCurrency];
    return exchangeRate;
  } catch (error) {
    throw new Error(`Unable to get currency ${fromCurrency} and ${toCurrency}`);
  }
}

async function getCountries(currencyCode) {
  try {
    const response = await axios.get(`https://restcountries.eu/rest/v2/currency/${currencyCode}`);

    return response.data.map(country => country.name);
  } catch (error) {
    throw new Error(`Unable to get countries that use ${currencyCode}`);
  }
}

async function convertCurrency(fromCurrency, toCurrency, amount) {
  let exchangeRate;
  let countries;

  await Promise.all([getExchangeRate(fromCurrency, toCurrency), getCountries(toCurrency)])
    .then(([exchangeRateValue, countriesValue]) => {
      exchangeRate = exchangeRateValue;
      countries = countriesValue;
    });

  const convertedAmount = (amount * exchangeRate).toFixed(2);

  return `${amount} ${fromCurrency} это ${convertedAmount} ${toCurrency}. Можно потратить в странах: ${countries}`;
}

async function showSelectOptions(select) {
  const response = await axios.get('http://www.apilayer.net/api/live?access_key=e21f00c9381b919cbe03c7bb7d67f0d2&format=1')
  const currency = Object.keys(response.data.quotes).map((elem) => elem.slice(3));

  for (let elem of currency) {
    let opt = document.createElement('option');
    opt.textContent = elem;
    select.append(opt);
  }
}

window.onload = () => {
  showSelectOptions(fromCurrencySelector)
  showSelectOptions(toCurrencySelector)

  submBtn.onclick = function() {
    if (amount.value > 0) {
      let fromCurrency = document.getElementById('fromCurrencySelector').value;
      let toCurrency = document.getElementById('toCurrencySelector').value;

      convertCurrency(fromCurrency, toCurrency, amount.value)
        .then((message) => {
          result.textContent = message;
        }).catch((error) => {
          console.log(error.message);
        });
    }
  }
}
