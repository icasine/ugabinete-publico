export interface Ferramenta {
  id: string;
  nome: string;
  resumo: string;
  descricao: string;
  categoria: string;
  url: string;
  exigeLogin: boolean;
  destaques: string[];
  comoUsar: string[];
  imagemDemo: string;
}
