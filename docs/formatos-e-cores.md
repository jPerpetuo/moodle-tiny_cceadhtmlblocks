# Sistema extensível de formatos e cores

O plugin deve representar um bloco de destaque como a combinação de um formato e uma cor. Formatos e cores são registros independentes, definidos em um único módulo AMD, para que novos itens possam ser incluídos sem alterar a estrutura da janela, os comandos do TinyMCE ou as operações que preservam conteúdo.

## Objetivo e limites

O documento define o contrato funcional e técnico para os blocos de destaque do `tiny_cceadhtmlblocks`.

O contrato cobre a escolha de formato, cor, prévia, HTML salvo, acessibilidade, preservação de conteúdo e evolução do catálogo. Ele não define configurações administrativas, carregamento de fontes externas ou uma alteração no core do Moodle.

## Catálogo inicial

O catálogo inicial terá três formatos e oito cores. A janela apresentará essas escolhas separadamente, resultando em 24 combinações possíveis sem apresentar uma lista de 24 modelos.

| Formato | Finalidade pedagógica | Aparência |
| --- | --- | --- |
| Caixa | Orientação, aviso ou conteúdo prioritário. | Fundo suave, borda, cantos arredondados e espaçamento interno. |
| Borda lateral | Definição, observação ou complemento que precisa de destaque discreto. | Fundo neutro, borda esquerda colorida de 2 px e recuo interno suave. |
| Citação | Citação, trecho legal, conceito-chave ou reflexão. | `blockquote`, tipografia relativa maior e linhas decorativas com a cor escolhida. |

| Identificador | Rótulo | Cor semântica |
| --- | --- | --- |
| `tip` | Dica | Verde |
| `information` | Informação | Azul |
| `attention` | Atenção | Amarelo |
| `important` | Aviso importante | Vermelho |
| `concept` | Conceito | Roxo |
| `example` | Exemplo | Turquesa |
| `activity` | Atividade | Laranja |
| `reflection` | Reflexão | Cinza-azulado |

A citação usará a cor selecionada nas linhas decorativas e em outros acentos discretos. Ela não aplicará uma cor de texto fixa.

Os tokens terão fundos pastel suaves, bordas e acentos de saturação moderada e texto em tom escuro. Os valores hexadecimais pertencem ao catálogo AMD, não à janela. Cada ajuste de paleta deverá verificar contraste antes de ser considerado definitivo.

## Contrato de extensibilidade

O módulo `amd/src/models.js` passará a exportar dois catálogos e funções de consulta. A tela, a prévia, o DOM e o CSS devem consumir esses catálogos, nunca uma lista local de formatos ou cores.

```js
export const formats = {
    box: {
        labelKey: 'format_box',
        previewKey: 'format_box_description',
        wrapperTag: 'div',
        cssModifier: 'box',
    },
    sidebar: {
        labelKey: 'format_sidebar',
        previewKey: 'format_sidebar_description',
        wrapperTag: 'div',
        cssModifier: 'sidebar',
    },
    quote: {
        labelKey: 'format_quote',
        previewKey: 'format_quote_description',
        wrapperTag: 'blockquote',
        cssModifier: 'quote',
    },
};

export const colors = {
    information: {
        labelKey: 'information',
        cssModifier: 'information',
        previewBackground: '#eaf3ff',
        previewBorder: '#2b6cb0',
    },
};
```

O trecho é um contrato de forma, não uma lista completa. Cada novo formato ou cor deve incluir identificador estável, chaves de idioma, modificador CSS, valores necessários para a prévia e estilos inline de contingência quando aplicáveis.

Adicionar uma cor não deve requerer modificação em `dialog.js`, `dom.js` ou nos comandos. Adicionar um formato pode requerer uma definição de estilos e de contingência, mas não deve criar uma rota nova de diálogo ou duplicar a lógica de preservação de conteúdo.

## HTML salvo e compatibilidade

Um novo bloco salvo terá uma classe base, modificadores de formato e cor, além de atributos de dados explícitos:

```html
<div class="ccead-htmlblock ccead-htmlblock--format-box ccead-htmlblock--color-information"
    data-ccead-htmlblock="1"
    data-ccead-htmlblock-format="box"
    data-ccead-htmlblock-color="information"
    role="note"
    aria-label="Informação">
    <p>Conteúdo do professor.</p>
</div>
```

O formato `quote` usará `blockquote` como elemento envolvente. Ao trocar entre `blockquote` e `div`, o plugin moverá os mesmos nós filhos para o novo envolvente dentro de uma transação de desfazer. Não poderá serializar e recriar o conteúdo por texto ou por `innerHTML`.

Os blocos atuais, que usam `data-ccead-htmlblock` com o identificador de cor, continuarão válidos. Ao editar um bloco legado, o plugin o interpretará como `box` com a cor indicada. Depois de aplicar uma alteração, ele poderá normalizar os atributos e classes para o novo contrato, sem modificar nós filhos, atributos dos filhos ou ordem do conteúdo.

Classes e atributos são a fonte de verdade. Estilos inline mínimos são uma contingência para manter borda, fundo, espaçamento ou tamanho relativo quando o CSS do plugin não estiver carregado. Não haverá fontes externas, carregamento remoto ou estilos inline nos elementos internos do conteúdo do professor.

## Interface da janela

A janela seguirá o mockup aprovado como referência e terá três seções redimensionáveis: Formato, Cor e Prévia. Ela terá esta ordem:

1. Escolha o formato, com três cartões acessíveis e prévias visuais.
2. Escolha a cor, com oito cartões compactos.
3. Veja a prévia do conteúdo selecionado, atualizada quando formato ou cor mudar.
4. Aplique, cancele ou remova o bloco existente.

O cartão selecionado terá `role="radio"`, `aria-checked="true"`, nome acessível e foco visível. Formatos e cores serão grupos de rádio distintos. A prévia receberá uma cópia segura dos nós selecionados, nunca os nós originais, e será identificada como prévia do resultado.

O divisor entre controles e prévia permitirá arrastar a altura das seções. Ele terá foco, `role="separator"`, orientação horizontal e suporte às teclas direcionais. Cada seção terá tamanho mínimo e rolagem própria quando o conteúdo exceder a área disponível.

A interface é prioritariamente de desktop, onde professores realizam a maior parte da autoria. Em telas pequenas, ela deve permanecer utilizável, sem uma segunda implementação: os grupos passam a uma coluna, os cartões preservam área de toque confortável, a prévia continua acessível por rolagem e o divisor arrastável é ocultado. A validação posterior em navegadores móveis verificará Chrome Android e Safari iOS. O aplicativo Moodle é um escopo separado, pois não se deve presumir que carregue subplugins Tiny de terceiros como o navegador móvel.

Ao abrir um bloco existente, a janela deverá refletir sua combinação atual. Para um bloco legado, a seleção inicial será Caixa e a cor legada. Para uma seleção nova, a seleção inicial será Caixa e Informação, salvo decisão futura de configuração administrativa.

## Regras de preservação

Aplicar, atualizar, converter ou remover um bloco deve obedecer às regras abaixo:

- Mover nós existentes, nunca reconstruir o conteúdo por string.
- Preservar negrito, itálico, links, mídia, listas, atributos e estilos inline já presentes nos filhos.
- Agrupar a alteração estrutural em uma transação do `undoManager` do TinyMCE.
- Não aninhar blocos de destaque. Uma seleção que cruza blocos incompatíveis permanecerá indisponível.
- Ao remover, eliminar somente o elemento envolvente e manter os filhos na mesma ordem.
- Não aplicar tamanho de fonte inline aos filhos. A citação usará escala relativa no envolvente, de modo que um tamanho explicitamente escolhido por `tiny_cceadfontsize` continue prevalecendo.

## Critérios de aceite

O incremento estará pronto para homologação quando atender aos critérios abaixo:

- A janela permite selecionar cada formato e cada cor, com prévia correspondente.
- A prévia usa uma cópia do conteúdo selecionado e o divisor pode ser operado por mouse e teclado.
- Cada combinação gera classes e atributos conforme o contrato.
- Um bloco existente permite trocar formato, trocar cor ou ambos na mesma ação.
- A remoção mantém o texto e toda a formatação interna.
- Uma seleção de vários parágrafos e listas preserva a estrutura original.
- A citação exibe escala tipográfica maior para texto sem tamanho explícito e respeita tamanho inline existente.
- O teclado alcança todos os cartões, botões e ações da janela.
- Em tela pequena, formato, cor e prévia permanecem acessíveis sem depender do divisor arrastável.
- O conteúdo mantém aparência básica sem o CSS do plugin por meio dos estilos de contingência necessários.
- Os testes automatizados proporcionais à manipulação DOM e a matriz Moodle 5.1 e 5.2 no GitHub Actions passam antes da homologação manual.
