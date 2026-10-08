# uGabinete (ugabinete.com.br)

Portal e vitrine de ferramentas web simples, acessíveis e intuitivas para o dia a dia do gabinete.

O site é 100% estático, responsivo, leve e sem inteligência artificial ou servidores adicionais, pronto para ser hospedado no **Cloudflare Pages**.

---

## 1. Como Publicar no Cloudflare Pages ligado ao GitHub

O Cloudflare Pages atualiza o seu site automaticamente sempre que você enviar alterações para o seu repositório no GitHub.

### Passo a passo:
1. Acesse o painel do [Cloudflare Dashboard](https://dash.cloudflare.com/) e faça login.
2. No menu lateral, clique em **Workers e Pages** e depois no botão **Criar aplicação** (ou **Create application**).
3. Selecione a aba **Pages** e clique em **Conectar ao Git** (Connect to Git).
4. Escolha a sua conta do GitHub e selecione o repositório do **uGabinete**.
5. Na tela de configuração de build (**Configurações de compilação**):
   - **Framework predefinido (Preset)**: selecione `Vite`.
   - **Comando de build (Build command)**: `npm run build`
   - **Diretório de saída (Build output directory)**: `dist`
   - **Variáveis de ambiente**: Não é necessária nenhuma variável.
6. Clique em **Salvar e implantar** (Save and Deploy).
7. Aguarde cerca de 1 minuto. O Cloudflare fornecerá o endereço publicado (ex: `ugabinete.pages.dev`).

---

## 2. Como Ligar o Domínio Personalizado `ugabinete.com.br`

Depois de publicado no Cloudflare Pages:

1. No painel do seu projeto no Cloudflare Pages, clique na aba **Domínios personalizados** (Custom domains).
2. Clique no botão **Configurar um domínio personalizado** (Set up a custom domain).
3. Digite `ugabinete.com.br` (e opcionalmente `www.ugabinete.com.br`).
4. Clique em **Continuar**.
5. Se o domínio estiver na Cloudflare: os apontamentos de DNS serão configurados automaticamente.
6. Se o domínio estiver no Registro.br ou similar: adicione um apontamento **CNAME** com o valor do subdomínio do Pages (ex: `ugabinete.pages.dev`).
7. O certificado de segurança SSL (HTTPS) é ativado gratuitamente em poucos minutos.

---

## 3. Como Adicionar ou Editar Ferramentas no `public/ferramentas.json`

Todas as ferramentas do site ficam cadastradas no arquivo **`public/ferramentas.json`**.  
Você pode editá-lo diretamente pelo GitHub no navegador clicando no ícone do lápis.

### Bloco Modelo para Copiar e Colar:

```json
{
  "id": "nome-da-ferramenta",
  "nome": "Nome Visível da Ferramenta",
  "resumo": "Uma frase curta e direta explicando o que ela faz.",
  "descricao": "Explicação mais detalhada sobre a finalidade da ferramenta e seus benefícios para a rotina de trabalho.",
  "categoria": "Documentos",
  "url": "https://link-da-sua-ferramenta.com",
  "exigeLogin": false,
  "icone": "FileText",
  "cor": "azul",
  "destaques": [
    "Primeiro recurso ou vantagem importante",
    "Segundo recurso prático da ferramenta",
    "Terceiro recurso relevante"
  ],
  "comoUsar": [
    "Acesse a ferramenta pelo botão 'Abrir ferramenta agora'.",
    "Preencha as informações solicitadas na tela inicial.",
    "Clique no botão de confirmação para concluir o uso."
  ],
  "imagemDemo": ""
}
```

### Explicação dos Campos:
- **`id`**: Apenas letras minúsculas, números e traços, sem espaços nem acentos (ex: `gerador-oficio`). Usado no link direto: `ugabinete.com.br/#gerador-oficio`.
- **`nome`**: Nome principal exibido no card e no topo da janela de detalhes.
- **`resumo`**: Frase direta de 1 linha exibida no card principal.
- **`descricao`**: Texto completo na seção "Para que serve".
- **`categoria`**: Nome da categoria (ex: *Documentos*, *Gestão*, *Atendimento*, *Calculadoras*).
- **`url`**: Link completo da aplicação (com `https://`).
- **`exigeLogin`**: `true` se exigir conta/senha própria, ou `false` se o acesso for livre.
- **`icone`** *(opcional)*: Nome de um ícone da biblioteca `lucide-react`. Exemplos populares:
  - `FileText` (documentos e textos)
  - `Users` (atendimento e pessoas)
  - `Calendar` (agendas e prazos)
  - `ClipboardList` (tarefas e cadastros)
  - `CheckSquare` (aprovações e checklist)
  - `Folder` (pastas e arquivos)
  - `Calculator` (cálculos)
  - `Briefcase` (processos administrativos)
  - `ShieldCheck` (validação e segurança)
  - `BarChart3` (indicadores e relatórios)
- **`cor`** *(opcional)*: Cor temática do card e da faixa de detalhes. Opções disponíveis:
  - `"azul"` (padrão)
  - `"verde"`
  - `"roxo"`
  - `"laranja"`
  - `"rosa"`
- **`destaques`**: Lista de pontos fortes ou recursos principais.
- **`comoUsar`**: Passo a passo numerado de instruções para o usuário.
- **`imagemDemo`**: Caminho da imagem de exemplo (ex: `"/demos/exemplo.png"`) ou vazio `""`.

> **Observação:** O campo de busca e o filtro de categorias passam a aparecer automaticamente na página quando houver 6 ou mais ferramentas cadastradas.

---

## 4. Como Adicionar Imagens de Demonstração

1. Adicione a sua imagem dentro da pasta **`public/demos/`** (por exemplo, `captura.png`).
2. No arquivo `public/ferramentas.json`, aponte para ela:
   ```json
   "imagemDemo": "/demos/captura.png"
   ```
3. Se a ferramenta não tiver imagem, deixe o campo vazio: `"imagemDemo": ""`.

---

## 5. Aplicativo no Celular (PWA) e Ícones Recomendados

O site é um **Progressive Web App (PWA)** instalável na tela inicial de smartphones (Android e iOS) e computadores desktop.

Para máxima compatibilidade com aparelhos mais antigos, você pode acrescentar na pasta `public/` as seguintes versões em PNG geradas a partir do `public/icon.svg`:

1. **`public/pwa-192x192.png`** (192 × 192 pixels) — Android / Chrome.
2. **`public/pwa-512x512.png`** (512 × 512 pixels) — Tela de abertura (splash screen).
3. **`public/apple-touch-icon.png`** (180 × 180 pixels) — Safari no iPhone e iPad.


## Segurança e regras do ferramentas.json

O site confere cada ferramenta antes de mostrar. Se algo estiver errado, aquela ferramenta é ignorada e as outras continuam aparecendo.

- `id`: só letras minúsculas, números e hífen (ex.: `gerador-oficios`). Não repita o mesmo id.
- `nome` e `url` são obrigatórios. O link precisa começar com `https://`.
- `imagemDemo`: caminho dentro de `/demos/` (ex.: `/demos/gerador.png`) ou um link `https://`.
- Nunca coloque senhas, tokens, e-mails pessoais ou links de repositórios privados: este repositório é público.

## Arquivos que não devem ser apagados

- `public/_headers`: cabeçalhos de segurança lidos pelo Cloudflare Pages (bloqueiam scripts de terceiros, impedem que o site seja embutido em outras páginas e controlam o cache).
- `public/sw.js`: service worker do aplicativo instalável. Sempre que alterar este arquivo, aumente a `VERSAO` no topo (v2, v3, ...).

Se um dia o site passar a usar imagens, fontes ou scripts de outro endereço, será preciso liberar esse endereço na linha `Content-Security-Policy` do `public/_headers`.
