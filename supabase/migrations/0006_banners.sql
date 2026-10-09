-- Banner (imagem larga 16:9, já com o texto) para eventos e destaques. Aparece na home e na página própria.
alter table public.eventos add column banner_url text;
alter table public.destaques add column banner_url text;
