export const fetchViaCep = async (cep) => {
  
    const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    throw new Error('O CEP deve conter 8 números.');
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado na base dos Correios.');
    }

    return {
      rua: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
      complemento: data.complemento,
    };
  } catch (error) {
    throw error;
  }
};