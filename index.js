const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, 'audio');
const result = [];

fs.readdirSync(baseDir, { withFileTypes: true }).forEach(dirent => {
  if (!dirent.isDirectory()) return;

  const albumName = dirent.name;
  const albumPath = path.join(baseDir, albumName);
  const albumId = albumName.split('-')[0]; // 提取专辑编号，例如 "01"

  const infoPath = path.join(albumPath, 'info.txt');
  const yearPath = path.join(albumPath, 'year.txt');

  const info = fs.existsSync(infoPath)
    ? fs.readFileSync(infoPath, 'utf8').trim()
    : '';
  const year = fs.existsSync(yearPath)
    ? fs.readFileSync(yearPath, 'utf8').trim()
    : '';

  // 查找封面图
  const coverExts = ['png', 'jpg', 'jpeg', 'webp'];
  let cover = "";
  for (const ext of coverExts) {
    const coverPath = path.join(albumPath, `cover.${ext}`);
    if (fs.existsSync(coverPath)) {
      cover = `https://testingcf.jsdelivr.net/gh/wallyperry/lz-song-${albumId}@main/cover.${ext}`;
      break;
    }
  }

  const albumData = {
    name: albumName,
    cover,
    info,
    year,
    state: 1,
    list: []
  };

  const files = fs.readdirSync(albumPath).filter(file =>
    /\.(mp3|m4a|wav|flac)$/i.test(file)
  ).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { numeric: true }));

  files.forEach(file => {
    const filePath = path.join(albumPath, file);
    const stats = fs.statSync(filePath);
    if (stats.size / (1024 * 1024) < 100) {
      const songName = file.replace(/\.(mp3|m4a|wav|flac)$/i, '');
      const lrcFile = path.join(albumPath, songName + ".lrc");
      const lrcUrl = fs.existsSync(lrcFile)
        ? `https://testingcf.jsdelivr.net/gh/wallyperry/lz-song-${albumId}@main/${encodeURIComponent(songName)}.lrc`
        : "";

      albumData.list.push({
        name: songName,
        artist: "李志",
        url: `https://testingcf.jsdelivr.net/gh/wallyperry/lz-song-${albumId}@main/${encodeURIComponent(file)}`,
        lrc: lrcUrl,
        state: 1
      });
    }
  });

  if (albumData.list.length > 0) {
    result.push(albumData);
  }
});

fs.writeFileSync(path.join(baseDir, '../api/music.json'), JSON.stringify(result, null, 2), 'utf8');
console.log("✅ music.json 已生成！");
