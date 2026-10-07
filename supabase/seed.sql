-- Dados de desenvolvimento do Hub S.I.

insert into public.gestoes (id, nome, slug, ano, descricao, ativa) values
  ('00000000-0000-4000-8000-000000000001', 'OverFlow', 'overflow-2026', 2026,
   'Gestão 2026 do D.A. de Sistemas de Informação da FAFRAM.', true);

insert into public.membros_gestao (gestao_id, nome, cargo, ordem) values
  ('00000000-0000-4000-8000-000000000001', 'Sofia Araki', 'Presidente', 1),
  ('00000000-0000-4000-8000-000000000001', 'Igor Cruz', 'Vice-Presidente', 2),
  ('00000000-0000-4000-8000-000000000001', 'Kauã Guerrero', 'Secretário', 3),
  ('00000000-0000-4000-8000-000000000001', 'Gabriel Mustafe', 'Vice-Secretário', 4),
  ('00000000-0000-4000-8000-000000000001', 'Beatriz Belini', 'Tesoureira', 5),
  ('00000000-0000-4000-8000-000000000001', 'Lucas Lima', 'Vice-Tesoureiro', 6);

insert into public.lotes (id, gestao_id, nome, status, abre_em, fecha_em, local_retirada) values
  ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001',
   'Lote 1 — 2026', 'aberto', now(), now() + interval '30 days', 'Sala do D.A. (a confirmar)');

insert into public.produtos (id, lote_id, slug, nome, descricao, categoria, preco_centavos, aceita_cartao, ordem) values
  ('00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000010',
   'camisa-hub-si', 'Camisa Hub S.I.', 'Camisa oficial do curso de Sistemas de Informação.',
   'vestuario', 6500, true, 1),
  ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000010',
   'caneca-hub-si', 'Caneca Hub S.I.', 'Caneca de cerâmica com a marca do curso.',
   'acessorios', 3500, true, 2);

insert into public.variacoes (produto_id, tamanho, cor, ordem)
select '00000000-0000-4000-8000-000000000020', t.tamanho, c.cor, t.ordem * 10 + c.ordem
from (values ('P', 1), ('M', 2), ('G', 3), ('GG', 4)) as t (tamanho, ordem)
cross join (values ('Preta', 1), ('Azul', 2)) as c (cor, ordem);

insert into public.eventos (slug, titulo, descricao, tipo, status, inicio, fim, local) values
  ('recepcao-calouros-2026', 'Recepção dos calouros', 'Evento de boas-vindas à nova turma.',
   'social', 'publicado', now() - interval '45 days', now() - interval '45 days' + interval '3 hours', 'Auditório FAFRAM'),
  ('workshop-git-github', 'Workshop de Git e GitHub', 'Do primeiro commit ao pull request.',
   'workshop', 'publicado', now() + interval '14 days', now() + interval '14 days' + interval '3 hours', 'Laboratório 2'),
  ('hackathon-overflow', 'Hackathon OverFlow', '24 horas para construir uma solução para o campus.',
   'hackathon', 'publicado', now() + interval '60 days', now() + interval '61 days', 'Laboratórios de Informática');

insert into public.links_hub (titulo, url, categoria, descricao, ordem) values
  ('Instagram do D.A.', 'https://instagram.com/', 'redes', 'Novidades e bastidores.', 1),
  ('Grupo de avisos', 'https://chat.whatsapp.com/', 'comunidade', 'Comunicados oficiais do curso.', 2),
  ('Matriz curricular', 'https://example.com/matriz', 'academico', 'Disciplinas e pré-requisitos.', 3),
  ('Biblioteca', 'https://example.com/biblioteca', 'academico', 'Acervo e reservas.', 4),
  ('Repositório do curso', 'https://github.com/', 'projetos', 'Projetos abertos dos alunos.', 5);
