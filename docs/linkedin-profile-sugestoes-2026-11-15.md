# Sugestões para o perfil do LinkedIn — 2026-11-15

**Preparado por:** skill `linkedin-refresh` (`.cursor/skills/linkedin-refresh/SKILL.md`)
**Perfil:** linkedin.com/in/your-username · **Snapshot:** `db/linkedin-profile.txt` (exportação commitada em 2026-07-27)
**Fonte da verdade:** `db/seed.sql` @ `52c1aa6` (2026-11-15) · **Regras de escrita:** `.cursor/skills/no-ai-slop`
**Espelho de:** `docs/linkedin-profile-suggestions-2026-11-15.md` — o arquivo em inglês é a fonte da verdade da skill; decisões novas entram lá primeiro e são espelhadas aqui
**Suposição:** o perfil lidera com **Engenheiro de IA** (seu cargo atual na YourClient); headline alternativa para o alvo Developer + AI na §3
**Idioma:** o LinkedIn não traduz nada, e headline/About têm um idioma só. Para vagas internacionais, aplique os blocos em inglês do documento EN; para o mercado brasileiro, use os blocos em português abaixo

## 1. Entradas

| Checagem | Valor |
|---|---|
| SEO do site (portfólio) | **75,7/100** — estático 45/45, copy 30,7/55 (piso 74,7 ✓) |
| ATS `ai-engineer` → AI Engineer | **58,3/100** · cobertura 85,0% · must-have 80,8% |
| ATS `fullstack-engineer` → Developer + AI | **63,6/100** · cobertura 92,2% · must-have 100% |
| ATS `product-engineer` → Média geral | **48,9/100** · cobertura 80,4% · must-have 100% |
| Must-haves ausentes (prevalência ≥ 70%) | ai-engineer: **PyTorch (82%)**, **AWS (72%)** — lacunas aceitas e documentadas ([cv-report §1](./cv-report-2026-11-14.md)); fullstack/product: nenhuma |

**Frescor do snapshot.** A exportação é anterior à reescrita do outono. Commits de seed depois dela: experiência e projetos da stealth (`daeb6e6`, `e609e96`), skills de dados da automação de e-mail (`ecbd380`), reenquadramento do pitch engenheiro-professor (`17c0120`), camada qualitativa do gate (`3eb6825`), reordenação de techs + refresh dos currículos (`52c1aa6`). Tudo o que esses commits adicionaram está ausente do LinkedIn.

**Economia de posicionamento.** O ATS pesa headline ×3, About/skills ×2, experiência/projetos ×1 (`scripts/lib/scoring/ats.ts`). Must-haves reivindicáveis entram primeiro na headline, depois no About e nas skills.

## 2. Prioridades

| P | Mudança | Por quê |
|---|---|---|
| **P1** | Adicionar **Especialista em Engenharia de IA — YourClient (YourClient \| YourClient)**, set 2026–hoje | Empregador atual completamente ausente; sua história de IA mais forte |
| **P1** | Adicionar **Engenheiro Full-Stack — Stealth Startup (NDA)**, jun 2026–hoje | Segundo cargo atual ausente; carrega a evidência Vertex AI / GCP / Terraform |
| **P1** | Fechar o cargo **YourCompany React** em set 2026 (o LinkedIn ainda mostra "Presente") | Fato desatualizado |
| **P1** | Substituir headline e About | Posicionamento de must-haves (×3/×2) + os dois blocos têm 4 meses de atraso |
| **P2** | Reescrever bullets de YourCompany React e YourCompany; limpar títulos de cargo | Padrões de slop + ausência de artefatos concretos |
| **P2** | Diff de skills (§6) | Entradas de lixo, keywords de alta prevalência ausentes |
| **P3** | Seção Destaques, limpeza de certificações, reconciliação de datas (§8) | Esforço baixo, risco baixo |

## 3. Headline

**Atual** (entupida de keywords, pré-YourClient, sem FastAPI/PostgreSQL/Docker/LangGraph/SQL):

> AI Engineer \| Full-Stack \| LLMOps, NLP and RAG Architect \| Python, Langchain, Typescript, ReactJS \| Git, CI/CD

**Sugerida** — 193/220 caracteres, carrega todos os must-haves reivindicáveis de ai-engineer com peso ×3:

```text
Especialista em Engenharia de IA @ YourClient | RAG, agentes de IA e LLMOps em produção | Python, LangChain, LangGraph, FastAPI, TypeScript, React, Docker, SQL | Cofundador de EdTech, ex-professor
```

**Alternativa** se o perfil for mirar **Developer + AI** (o currículo fullstack pontua mais alto: 63,6, 100% must-haves):

```text
Engenheiro Full-Stack | React, TypeScript, Python, FastAPI, PostgreSQL, Docker | APIs de LLM em funcionalidades de produto | Harnesses de agente Cursor, automação de testes | Cofundador de EdTech
```

Por quê: "AI Engineer", "RAG", "LangChain" e "Python" já estavam lá; "FastAPI", "LangGraph", "Docker", "SQL" e "PostgreSQL" não estavam, e todos têm prevalência de 65–88% em `market-insights.ts`. O título agora nomeia seu cargo real em vez de um cargo-alvo — recrutadores pesam o campo headline mais que qualquer outro.

## 4. Sobre

**Problemas do texto atual** (2.441 caracteres, sem YourClient/stealth, escrito durante a busca de emprego):

| Linha atual | Padrão |
|---|---|
| "I am **passionate** about **leveraging** AI to solve real-world problems" | Palavras banidas (no-ai-slop) |
| "ensuring efficient data processing and scalable infrastructures" | Cláusula de propósito falso |
| "making the platform both powerful and user-friendly" | Inchaço de importância |
| "My ability to bridge the gap between technology and business needs allows me to create scalable AI solutions with real-world impact" | Autoelogio abstrato; falha no teste de portabilidade |
| "I stay updated with advancements in generative AI… continuously improving my skill set" | Enchimento |
| "I am actively seeking opportunities as an AI Engineer" | Desatualizado — você está empregado desde que isso foi escrito |
| "**cutting-edge** projects", "**robust** AI workflows" | Palavras banidas |
| "Whether it's designing… I thrive on tackling complex challenges" | Enchimento retórico |
| "Let's shape the future of AI together!" | Fecho de falsa profundidade |
| Menções a Langflow, multimodal AI, reinforcement learning | Não estão no CV atual — ver §8 |

(as citações ficam no original em inglês porque transcrevem o perfil publicado)

**Revisão de storytelling (2026-11-15).** O arco funciona: engenheiro → professor → engenheiro segue legível em seis parágrafos, todo número é real, e a linha mais forte é "Eu sei quanto custa o software para quem usa, porque eu era o cliente." Três correções aplicadas ao bloco abaixo:

1. **Bug de cronologia.** "Entre os dois" colocava a stealth entre o YourCompany e a YourClient sem dizer que ela segue ativa — um recrutador leria como encerrada. Os dois cargos atuais agora abrem o texto ("Agora:" / "Também agora:"); a história vem em ordem reversa.
2. **Muro de keywords.** O parágrafo do YourCompany era uma frase-inventário de ~60 palavras no meio de uma história. A cobertura de keywords ficou; o ritmo voltou separando resultado (horas → segundos) de mecanismo ("Por baixo dos panos: …").
3. **Fim frio.** O texto terminava numa lista de keywords. O fecho agora reaproveita o seu próprio pitch do site ("A graduação me ensinou sistemas determinísticos; a IA generativa, probabilísticos.") — passa no teste de portabilidade, coisa que o antigo "Let's shape the future of AI together!" não passava.

De propósito fora: boilerplate de "aberto a oportunidades" (você está empregado; o inbound vem da headline).

**Substituição sugerida** — 1.784/2.600 caracteres, arco engenheiro-professor do pitch do site, todo must-have reivindicável com peso ×2:

```text
Me formei em engenharia de automação, passei uma década dando aula e administrando escolas e voltei para a engenharia para construir o software que faltava nesse mundo.

Agora: Especialista em Engenharia de IA na YourClient para YourClient | YourClient. Lidero o rollout de IA como infraestrutura: harnesses de desenvolvimento conectados ao CI/CD, dashboards para a diretoria e governança entre squads para 8 times de engenharia e dados que entregam serviços bancários numa migração de core banking.

Também agora: full-stack e engenharia de IA numa startup stealth construindo uma plataforma social geolocalizada, com backend em C#/.NET, frontend em React, apps em Flutter e serviços de IA em Python (LangChain, Vertex AI) na GCP, sobre Terraform e GitHub Actions.

Antes disso, cofundei o YourCompany, um SaaS de EdTech para professores de inglês. Produzir aula levava horas; nossos pipelines de LangChain e LangGraph cortaram para segundos. Por baixo dos panos: busca RAG, roteamento de LLM, prompt chains, saídas estruturadas guardadas por LangSmith, harnesses de avaliação, APIs REST em FastAPI no Supabase e PostgreSQL, Docker e CI/CD com GitHub Actions, e chamadas multi-provedor (OpenAI, Claude, Gemini, GroqCloud) com fallbacks.

A década em sala de aula ainda paga as contas. Na escola que administrei (50+ alunos), um CRM em Python transformava relatórios financeiros em CSV em dashboards de retenção, convertia 60%+ dos leads em alunos pagantes e cortou o churn pela metade. Eu sei quanto custa o software para quem usa, porque eu era o cliente.

A graduação me ensinou sistemas determinísticos; a IA generativa, probabilísticos. Essa mistura é como eu construo.

Stack: Python, TypeScript, React, SQL, Docker, LangChain, LangGraph, FastAPI, PostgreSQL, LangSmith, CrewAI, Kubernetes.
```

Notas: zero travessões, zero palavras banidas, números vêm direto do seed (8 squads, horas→segundos, 50+ alunos, 60%+ leads, churn pela metade). PyTorch e AWS ausentes de propósito — são as duas lacunas aceitas documentadas; GCP/Vertex AI é o posicionamento honesto (§8.2).

## 5. Experiência

### 5.1 ADICIONAR — Especialista em Engenharia de IA · YourClient (YourClient | YourClient)

Set 2026 – Hoje · Your City, Brasil. Este é o seu cargo atual; ele não existe em lugar nenhum do LinkedIn.

```text
Liderando o rollout de IA como infraestrutura para os serviços bancários da YourClient | YourClient: harnesses de desenvolvedor integrados ao CI/CD, governança técnica e entrega entre squads numa migração de core banking.

- Lidero o rollout de harnesses de IA para desenvolvedores nos pipelines de CI/CD para 8 squads de engenharia e dados
- Orquestro entrega entre squads e governança técnica nas squads da migração
- Construí automação em lote em Python e React que gerencia tarefas Kanban e metadados de cards para 8 squads
- Construí dashboards de gestão que acompanham performance dos times e marcos da migração para a diretoria
- Escrevi playbooks técnicos, guias de troubleshooting e material de onboarding para a adoção dos harnesses de IA
```

Fonte: seed, linha de experiência 11 + highlights 55–59.

### 5.2 ADICIONAR — Engenheiro Full-Stack · Stealth Startup (NDA)

Jun 2026 – Hoje · Your City, Brasil. Carrega a evidência de Vertex AI / GCP / Terraform de que o CV depende.

```text
Engenharia full-stack, IA, dados e DevOps numa plataforma social geolocalizada: backend em C#/.NET, frontend em React, apps em Flutter e serviços de IA em Python na GCP.

- Construí uma plataforma de criação com agentes e RAG em LangGraph e Qdrant
- Rodei pipelines ETL dos dados geolocalizados da eleição de 2026 em Docker e Kubernetes
- Implementei ingestão multi-tenant de menus de restaurantes a partir de HTML, PDF, PNG e QR codes
- Entreguei rastreamento de ônibus em tempo real
- Automatizei todos os fluxos de cards e backlogs do Jira com um harness de SDLC e quality gates de IA (arquitetura de sistema, cobertura de testes, custo, lint, varredura de vulnerabilidades)
- Gerenciei infraestrutura na GCP com Terraform e Cloud Run atrás de CI/CD no GitHub Actions, com load balancing e workflows assíncronos
```

Fonte: seed, linha de experiência 12 + highlights 60–66.

### 5.3 ATUALIZAR — Desenvolvedor Frontend Sênior · YourCompany (React) — fechar e reescrever

Data final em **set 2026** (hoje está "Presente"). Retitular de "Senior Frontend Engineer ReactJS Typescript Cursor" — título de cargo entupido de keywords lê como spam; keyword vai em bullet. Dois bullets atuais para deletar:

> "Acting as a bridge between product strategy and technical execution, contributing to feature ideation…" — clichê de ponte, zero artefatos
> "Enabling the squad through AI adoption initiatives, and knowledge-sharing new practices." — vago, zero artefatos

**Bullets sugeridos** (fonte: highlights 1–5):

```text
- Desenvolvi funcionalidades de frontend a partir de especificações de design, engenharia e negócio
- Desenvolvi e testei o agent harness de Cursor usado pelo time de frontend
- Construí tooling de agente que cortou uso de tokens e latência nos fluxos de Cursor
- Criei um harness de testes que gera e valida testes unitários e de integração
- Construí dashboards que revelam insights de negócio a partir dos dados de produto
```

### 5.4 ATUALIZAR — Desenvolvedor Frontend Sênior · YourCompany (Flutter) — retitular

Retitular de "Senior Frontend Developer Flutter Dart Flutterflow" para "Senior Frontend Developer" (ferramenta vai em bullet — e FlutterFlow está aposentado como ferramenta atual, §11; o CV lista Flutter/Dart neste cargo). Correções de bullets só onde a redação está ruim:

| Atual | Sugerido |
|---|---|
| "Stack Migration AI-Agent Framework from Flutter to Javascript" | "Migrei o framework de agente da stack de Flutter para JavaScript" |
| "Creating Agent-Driven frameworks for documenting frontend and developing new features inside a legacy system." | "Construí frameworks guiados por agente que documentam o frontend e orientam features novas no sistema legado" |
| "API Integration tests using Postman and DevTools" | "Escrevi testes de integração de API com Postman e DevTools" |
| "Creating data processing DART functions to build charts and dashboards" | "Construí funções em Dart que transformam dados brutos em gráficos e dashboards" |
| "Prototyping API Endpoints on Supabase / Postgresql" | "Prototipei endpoints de API no Supabase / PostgreSQL" |

Fontes: highlights 51–54 + seus próprios bullets do snapshot, limpos.

### 5.5 ATUALIZAR — YourCompany — retitular, redatar, reescrever

- Título: "Founding Engineer - Typescript Flutterflow Python Data Visualization Langchain" → **Cofundador & Desenvolvedor Líder** (bate com o CV; "Founding Engineer" enfraquece a leitura de sociedade).
- Datas: o CV diz **nov 2023 – mai 2026**; o snapshot diz dez 2023 – abr 2026. Use as datas do CV (§8.5).
- Intro da descrição (seed, linha 3): "Cofundei um SaaS de EdTech com IA para professores de inglês: trilhas de aprendizagem personalizadas e automação de aulas que cortou a produção de conteúdo de horas para segundos."

Slop nos bullets atuais: "Spearheading the development of…" (verbo forte de mentira), "Leveraging 8+ years of teaching… to inform core functionalities" (palavra banida + vago), "loosen my operational bottlenecks with AI prompt chains and COT" (typo + vago), "to ensure market success within the EdTech landscape" (inchaço de importância).

**Bullets sugeridos** (fonte: highlights 45–50):

```text
- Construí o SaaS de EdTech com IA em FlutterFlow, Supabase, Edge Functions em TypeScript, Dart, Flutter e Python
- Construí um pipeline de CI/CD enxuto com GitHub Actions e Vercel para deploys multi-ambiente
- Integrei APIs de LLM multi-provedor (OpenAI, Claude, Gemini, GroqCloud) com LangChain e LangSmith em prompt chains e workflows de chain-of-thought
- Implementei roteamento de LLM para geração de dados estruturados, limpeza, validação e mecanismos de fallback
- Liderei testes unitários, design de schema SQL, arquitetura, gestão de banco de dados e backends PostgreSQL escaláveis
- Contribuí para estratégia de negócio, marca, precificação, vendas e dashboards de modelagem financeira
```

A menção a FlutterFlow no primeiro bullet fica de propósito: descreve como o YourCompany foi construído (seed highlight 45, tempo passado, cargo encerrado em mai 2026). Pela §11 ela nunca pode aparecer em campo de tempo presente — headline, About, skills ou cargos ativos.

### 5.6 MANTER

Os bullets de Better Call Your, YourCompany, YourUniversity, YourAdvisor, and YourInstitution já são verb-first e concretos (CRM em Python/Streamlit, 60%+ conversão de leads, churn −50%, tarefas de correção de vestibulares). Sem reescrita; duas divergências de data estão na §8.

## 6. Skills

A lista atual mistura keywords reais com lixo adicionado pelo LinkedIn ("acquire gim suite", "across", "acting", "click", "clean"). Skills são campo de peso ×2; poda com agressividade e adicione as de alta prevalência que faltam.

**Adicionar** (cada uma rastreia o seed):

| Skill | Fonte |
|---|---|
| FastAPI | pitch do site, descrição ai-engineer |
| LangGraph | chips ai-engineer; highlight 60 da stealth |
| LangSmith | chips; highlight 47 do YourCompany |
| Vertex AI | experiência stealth |
| Google Cloud Platform (GCP) | experiência stealth |
| Terraform | highlight 65 da stealth |
| Kubernetes | chips dos três perfis; highlight 61 da stealth |
| Docker | chips product; linhas stealth/YourCompany |
| GitHub Actions | highlight 46 do YourCompany; highlight 65 da stealth |
| C#/.NET | experiência stealth |
| Qdrant | highlight 60 da stealth |
| LLM Evaluation | descrição ai-engineer ("evaluation harnesses") |
| Vector Databases | descrição ai-engineer ("vector search"); Qdrant |

**Manter:** Python, TypeScript, React, RAG, AI Agents, Prompt Engineering, CI/CD, PostgreSQL, Supabase, Flutter, LangChain, CrewAI (todas já presentes, todas de alta prevalência).

**Remover:** os tokens de lixo acima e quase-duplicados (sugestões automáticas do LinkedIn tipo "ai agent" vs "ai-agent" vs "ai agents" — mantenha uma forma). Elimine a entrada FlutterFlow — aposentada pela §11 (Flutter simples fica). Fixe três no topo alinhadas ao alvo: Python, LangChain, RAG.

## 7. Destaques, projetos, certificações

- **Destaques (Featured):** adicione o portfólio (`https://your-fullstack.vercel.app`, `website_url` do seed). Um link forte vale mais que quatro fracos.
- **Seção GitHub:** ok como está; considere tirar repositórios sem manutenção ("practice").
- **Certificações (resolvido em 2026-11-15):** os oito certificados NoCode StartUp (2023–24) antecedem o pivô para engenharia e agregam pouco perto da história YourClient/YourClient; com FlutterFlow aposentado (§11), nenhum garante a vaga — descarte os oito. O TOEFL mostra "Expires: Sep 2015" — ou remove, ou mantenha só o Cambridge FCE (que não expira).

## 8. Perguntas abertas

1. **Alvo principal.** Assumi Engenheiro de IA (seu cargo atual). O currículo fullstack pontua mais alto (63,6, 100% must-haves). Se o foco são vagas full-stack, troque para a headline alternativa da §3 e reordene a linha de Stack do About.
2. **PyTorch (82%) e AWS (72%)** ficam fora pela decisão de lacunas aceitas documentada no relatório de CV. Se o trabalho na stealth tocou PyTorch ou AWS desde então, me avise que eu adiciono claims verdadeiros.
3. **Escopo do NDA.** A §5.2 descreve a categoria da plataforma (social geolocalizada) e a stack sem nomeá-la. Confirme que o contrato permite isso.
4. **Início na YourCompany React:** LinkedIn diz jan 2026; CV diz dez 2025.
5. **Datas do YourCompany:** CV nov 2023 – mai 2026 vs LinkedIn dez 2023 – abr 2026; a página da empresa no LinkedIn ("YourCompany Education", fundada em 2024) também diverge da fundação. Escolha uma história.
6. **Datas da YourCompany:** LinkedIn jun 2017 – fev 2020 vs CV nov 2016 – jan 2020 (e a linha ESL no CV carrega o mesmo período do cargo de coordenador). Confirme antes de mexer na YourCompany.
7. **Início do Better Call Your:** LinkedIn fev 2020 vs CV jan 2020.
8. **Churn −50%** aparece para a escola particular (About) e para a YourCompany (bullets). Se os dois são verdadeiros como escritos, ok — mas recrutador nota métrica reivindicada duas vezes; confirme.
9. **Langflow / multimodal AI / reinforcement learning** estavam no About antigo e não estão no CV; a reescrita os derruba. Se você usa Langflow de verdade e quer de volta, me avise.
10. **FlutterFlow no CV e nos currículos** — resolvido para o LinkedIn (§11), mas o seed ainda carrega FlutterFlow como tech histórica nas linhas YourCompany/YourCompany, chips, tabelas de skills dos currículos e na headline do product-engineer, então os PDFs ATS ainda citam. É história verdadeira; se quiser tirar dos PDFs também, é um edit em `db/seed.sql` com efeito nos scores — me avise.

## 9. Aplicar e fechar o ciclo

1. Cole cada bloco ```text no campo correspondente do LinkedIn (headline ≤ 220, Sobre ≤ 2.600, descrição ≤ 2.000 por cargo).
2. Aplique o diff de skills.
3. Reexporte o perfil (LinkedIn → perfil → Mais → "Salvar em PDF", ou o que gerou `db/linkedin-profile.txt`) e substitua o arquivo.
4. Rode `npm run audit:content -- --json=data/seo-ats-report.json` — nada muda lá (a auditoria pontua o site/CV, não o LinkedIn), mas o snapshot fresco faz a próxima rodada do `linkedin-refresh` gerar diffs limpos.
5. As contagens de caracteres dos blocos deste documento estão na §10.

## 10. Contagem de caracteres (medida)

| Campo | Contagem | Limite |
|---|---|---|
| Headline (alvo Engenheiro de IA) | 193 | 220 |
| Headline (alternativa Full-Stack) | 195 | 220 |
| Sobre (reescrita) | 1.784 | 2.600 |
| Descrição YourClient (§5.1) | 744 | 2.000 |
| Descrição Stealth (§5.2) | 814 | 2.000 |
| Bullets YourCompany React (§5.3) | 425 | 2.000 |
| Bullets YourCompany (§5.5) | 695 | 2.000 |

*(Contagem via passada Node pelos blocos `text` deste documento; refaça após editar.)*

## 11. Registro de decisões

Decisões duráveis, da mais antiga para a mais recente. Rodadas futuras do `linkedin-refresh` leem esta seção antes de escrever. Fonte da verdade: a seção equivalente do documento em inglês; mantenha as duas sincronizadas.

| Data | Decisão |
|---|---|
| 2026-11-15 | **FlutterFlow aposentado.** Você não usa mais; a prática atual é low-code ocasional no backend para ganhar velocidade. Não pode aparecer em nenhum campo do LinkedIn no tempo presente (headline, About, skills, cargos ativos). Menções históricas ficam só onde descrevem construções passadas (bullet do YourCompany em §5.5, e o texto de recomendação do snapshot, que é palavra de terceiros). O certificado de FlutterFlow cai junto com os outros certificados NoCode StartUp (§7). Se os currículos/seed também devem parar de citar é questão aberta §8.10. |