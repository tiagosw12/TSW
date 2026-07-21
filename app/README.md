# Ficha de Estudos

PWA em React que consome o backend Supabase deste repositório (`../supabase/migrations`).

## Setup

1. Aplique as migrations de `../supabase/migrations` no seu projeto Supabase (SQL editor ou Supabase CLI), na ordem dos nomes dos arquivos.
2. Copie `.env.example` para `.env` e preencha com a URL e a anon key do seu projeto:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. `npm install && npm run dev`

## Estrutura

- `src/screens/HomeScreen.tsx` — fila de prioridade (chama `get_topic_priorities` via RPC), ponto de entrada para todas as outras telas (menu + FAB).
- `src/screens/TimerSheet.tsx` — timer por tópico; abre pré-preenchido a partir de um card da fila, ou avulso pelo botão `+`. Grava em `study_sessions` ao final do ciclo.
- `src/screens/SubjectsSheet.tsx` / `ExamsSheet.tsx` / `ProfileSheet.tsx` — CRUDs em modal/sheet sobre a Home.
- `src/components/RetentionTrace.tsx` — o traçado tipo ECG por tópico: o lado direito da curva (o valor "agora") é sempre igual ao `estimated_retention` real vindo do banco; os picos à esquerda marcam sessões/quizzes passados dentro da janela de 30 dias.
- `src/hooks/*` — acesso a dados (Supabase client direto, sem camada extra de cache).

Sem suporte offline nesta fase: o timer roda em estado local da tela e só persiste ao final do ciclo, com aviso caso a gravação falhe por falta de rede.
