import * as fs from 'fs';
import * as path from 'path';

function loadThemes() {
  const themesDir = __dirname;
  const themeFiles = fs.readdirSync(themesDir).filter(file => file.endsWith('.ts') && file !== 'index.ts');

  const themeList = themeFiles.map(file => {
    const themeModule = require(path.join(themesDir, file));
    const themeName = Object.keys(themeModule)[0];
    return themeModule[themeName];
  });

  const themeOptions = themeList.map(theme => ({
    label: theme.label,
    value: theme.value,
  }));

  const themes = themeList.reduce((acc, theme) => {
    acc[theme.value] = theme.properties;
    return acc;
  }, {} as Record<string, Record<string, string>>);

  return { themeOptions, themes };
}

export const { themeOptions, themes } = loadThemes();
