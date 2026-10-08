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
4. Escolha a sua conta do GitHub e selecione o repositório do **uGabinete** (`icasine/ugabinete-publico`).
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

## 3. Painel Administrativo "Gerenciar"

O site conta com um painel visual para você cadastrar, editar, reordenar, duplicar e excluir ferramentas sem precisar mexer em código:

- **Como acessar**: clique no ícone discreto de engrenagem no rodapé da página ou acesse diretamente pelo link: `ugabinete.com.br/#gerenciar`.
- **Autenticação**: o painel solicita um Token de Acesso Pessoal Fine-Grained do GitHub (`github_pat_...`) com permissão **Contents: Read and write** para o repositório `icasine/ugabinete-publico`.
- **Publicação direta**: ao clicar em **Publicar alterações**, o painel grava os arquivos `public/ferramentas.json`, `public/_redirects` e as fotos cortadas em WebP diretamente na branch `main` via API do GitHub.
- **Histórico**: há um link direto para o histórico de commits do GitHub para conferir ou reverter alterações passadas.

---

## 4. Cadastro e Edição Manual no `public/ferramentas.json`

Caso prefira editar diretamente pelo GitHub no navegador, todas as ferramentas ficam em `public/ferramentas.json`.

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
  "imagem": "",
  "imagemDemo": "",
  "tipo": "aplicativo",
  "visivel": true,
  "atalho": "oficio",
  "destaques": [
    "Primeiro recurso ou vantagem importante",
    "Segundo recurso prático da ferramenta",
    "Terceiro recurso relevante"
  ],
  "comoUsar": [
    "Acesse a ferramenta pelo botão 'Abrir ferramenta agora'.",
    "Preencha as informações solicitadas na tela inicial.",
    "Clique no botão de confirmação para concluir o uso."
  ]
}
```

### Explicação dos Campos:
- **`id`**: Apenas letras minúsculas, números e traços (ex: `gerador-oficio`). Usado no link direto: `ugabinete.com.br/#gerador-oficio`.
- **`nome`**: Nome principal exibido no card e no topo da janela.
- **`resumo`**: Frase direta de 1 linha exibida no cartão.
- **`descricao`**: Texto completo na seção "Para que serve".
- **`categoria`**: Nome da categoria (ex: *Documentos*, *Gestão*, *Atendimento*, *Calculadoras*).
- **`url`**: Link completo da aplicação (obrigatório começar com `https://`).
- **`exigeLogin`**: `true` se exigir conta/senha própria, ou `false` se o acesso for livre.
- **`tipo`** *(opcional)*:
  - `"aplicativo"` (padrão): cartão com botão "i" para janela explicativa detalhada.
  - `"link"`: redirecionador direto (o clique leva direto ao site, sem janela de detalhes).
- **`visivel`** *(opcional)*: `true` (padrão) para exibir no site público, ou `false` para manter oculto aos visitantes.
- **`atalho`** *(opcional)*: texto curto sem barras (ex: `"mapa"`). O Cloudflare Pages criará o redirecionamento `/mapa -> https://link` via `public/_redirects`.
- **`imagem`** *(opcional)*: caminho de foto quadrada em `/icones/<id>.webp`. Se preenchido, o cartão exibe a foto no lugar do ícone.
- **`imagemDemo`** *(opcional)*: caminho da captura de tela de exemplo em `/demos/<id>.webp`.
- **`icone`** *(opcional)*: nome de um ícone da biblioteca `lucide-react` (ex: `FileText`, `Users`, `Calendar`, `ClipboardList`, `Calculator`, `Briefcase`, `ShieldCheck`, `BarChart3`).
- **`cor`** *(opcional)*: cor temática (`"azul"`, `"verde"`, `"roxo"`, `"laranja"`, `"rosa"`).
- **`destaques`**: lista de vantagens ou recursos principais.
- **`comoUsar`**: lista de passos numerados de orientação ao usuário.

---

## 5. Atalhos Curtos e `public/_redirects`

Quando uma ferramenta possui o campo `"atalho": "mapa"`, o painel gera automaticamente uma linha no arquivo `public/_redirects`:

```
/mapa https://link-da-ferramenta.com 302
```

Dessa forma, qualquer pessoa que acessar `ugabinete.com.br/mapa` será redirecionada automaticamente pelo Cloudflare Pages para o endereço da ferramenta.

---

## 6. Aplicativo no Celular (PWA) e Ícones Recomendados

O site é um **Progressive Web App (PWA)** instalável na tela inicial de smartphones (Android e iOS) e computadores desktop.

Arquivos de ícone recomendados na pasta `public/`:
1. **`public/icon-192.png`** (192 × 192 pixels) — Android / Chrome.
2. **`public/icon-512.png`** (512 × 512 pixels) — Tela de abertura (splash screen).
3. **`public/icon-maskable-512.png`** (512 × 512 pixels) — Ícone adaptável para Android.
4. **`public/apple-touch-icon.png`** (180 × 180 pixels) — Safari no iPhone e iPad.
5. **`public/icon.svg`** — Vetor SVG universal.

---

## 7. Segurança e Regras do `ferramentas.json`

O site confere cada ferramenta antes de mostrar. Se algo estiver errado, aquela ferramenta é ignorada e as outras continuam aparecendo.

- `id`: só letras minúsculas, números e hífen. Não repita o mesmo id.
- `nome` e `url` são obrigatórios. O link precisa começar com `https://`.
- `imagem` e `imagemDemo`: caminhos locais ou links `https://`.
- Nunca coloque senhas, tokens, e-mails pessoais ou links de repositórios privados: este repositório é público.

---

## 8. Arquivos que não devem ser apagados

- `public/_headers`: cabeçalhos de segurança do Cloudflare Pages (inclui liberação de `https://api.github.com` em `connect-src` para o painel administrativo funcionar no domínio publicado).
- `public/sw.js`: service worker do aplicativo instalável. Sempre que alterar este arquivo, aumente a `VERSAO` no topo (v2, v3, ...).
