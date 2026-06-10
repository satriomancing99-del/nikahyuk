-- 018_seed_bgm_library.sql
-- Migration to seed the default/public BGM songs list in the database.

INSERT INTO public.music_library (title, artist, url, is_private)
SELECT title, artist, url, is_private
FROM (VALUES
  -- Indonesian Pop / Romantic
  ('Janji Suci', 'Yovie & Nuno', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Akad', 'Payung Teduh', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Teman Hidup', 'Tulus', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Kisah Romantis', 'Glenn Fredly', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Menikahimu', 'Kahitna', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Pilihanku', 'MALIQ & D’Essentials', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Kesempurnaan Cinta', 'Rizky Febian', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Akhirnya Aku Menemukanmu', 'NaFF', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Anugerah Terindah yang Pernah Kumiliki', 'Sheila On 7', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Aku dan Dirimu', 'Ari Lasso feat. BCL', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Bukti', 'Virgoun', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Cinta Luar Biasa', 'Andmesh', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Bukan Cinta Biasa', 'Afgan', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Could It Be', 'Raisa', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),

  -- International Pop / Romantic
  ('A Thousand Years', 'Christina Perri', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Perfect', 'Ed Sheeran', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Marry You', 'Bruno Mars', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('All of Me', 'John Legend', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('From This Moment On', 'Shania Twain', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Endless Love', 'Lionel Richie & Diana Ross', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('I Finally Found Someone', 'Barbra Streisand & Bryan Adams', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('You Are the Reason', 'Calum Scott', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Can’t Help Falling in Love', 'Elvis Presley', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Sugar', 'Maroon 5', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),

  -- Islamic / Nasheed
  ('Barakallah', 'Maher Zain', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', false),
  ('For the Rest of My Life', 'Maher Zain', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', false),
  ('Sepanjang Hidup', 'Maher Zain', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', false),
  ('Ya Nabi Salam Alayka', 'Maher Zain', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', false),
  ('Assalamu Alayka', 'Maher Zain', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', false),
  ('Deen Assalam', 'Sabyan', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', false),
  ('Ya Maulana', 'Sabyan', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', false),
  ('Aisyah Istri Rasulullah', 'Sabyan', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', false),
  ('Allah Allah Aghisna', 'Sabyan', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', false),
  ('Wedding Nasheed Instrumental', 'Instrumental', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', false),

  -- Classical / Instrumental
  ('Canon in D', 'Johann Pachelbel', 'https://archive.org/download/PachelbelCanonInDMajor/Pachelbel%20-%20Canon%20in%20D%20Major.mp3', false),
  ('A Thousand Years Instrumental', 'Instrumental', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('Perfect Instrumental', 'Instrumental', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false),
  ('River Flows in You', 'Yiruma', 'https://archive.org/download/canonindpachelbel/Pachelbel%27s%20Canon%20in%20D%20--%20Piano%20Solo.mp3', false),
  ('Kiss the Rain', 'Yiruma', 'https://archive.org/download/canonindpachelbel/Pachelbel%27s%20Canon%20in%20D%20--%20Piano%20Solo.mp3', false),
  ('Beautiful in White Instrumental', 'Instrumental', 'https://archive.org/download/canonindpachelbel/Pachelbel%27s%20Canon%20in%20D%20--%20Piano%20Solo.mp3', false),
  ('Wedding March', 'Felix Mendelssohn', 'https://archive.org/download/78_wedding-march_symphony-orchestra-mendelssohn_gbia0012855a/01%20-%20Wedding%20March.mp3', false),
  ('Can’t Help Falling in Love Instrumental', 'Instrumental', 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3', false)
) AS t(title, artist, url, is_private)
WHERE NOT EXISTS (
  SELECT 1 FROM public.music_library WHERE music_library.title = t.title AND music_library.artist = t.artist
);
