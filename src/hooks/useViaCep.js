import { useEffect, useState } from 'react';

const fetchViaCep = async (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) throw new Error('CEP inválido.');
  
  const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  const data = await response.json();
  
  if (data.erro) throw new Error('CEP não encontrado.');
  return data;
};

export const useViaCep = (initialData = null) => {
  const [endereco, setEndereco] = useState({
    cep: '', rua: '', bairro: '', cidade: '', estado: '', numero: '', complemento: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setEndereco({
        cep: initialData.CEP || '',
        rua: initialData.logradouro || '',
        bairro: initialData.bairro || '',
        cidade: initialData.cidade || '',
        estado: initialData.estado || '',
        numero: initialData.numero || '',
        complemento: initialData.complemento || ''
      });
    }
  }, [initialData]);

  const buscarCep = async (cepText) => {
    if (!cepText || cepText.replace(/\D/g, '').length < 8) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchViaCep(cepText);
      setEndereco(prev => ({
        ...prev,
        cep: cepText,
        rua: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        complemento: data.complemento ? `${data.complemento} ${prev.complemento}`.trim() : prev.complemento
      }));
    } catch (err) {
      setError(err.message);
      setEndereco(prev => ({ ...prev, rua: '', bairro: '', cidade: '', estado: '' }));
    } finally {
      setLoading(false);
    }
  };

  const atualizarEndereco = (campo, valor) => {
    setEndereco(prev => ({ ...prev, [campo]: valor }));
  };

  return { endereco, loading, error, buscarCep, atualizarEndereco };
};