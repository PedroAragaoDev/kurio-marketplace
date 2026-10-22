import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { platform, release, cpus } from 'node:os'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { chromium } from '@playwright/test'

const output = 'audit-results'
const baseUrl = 'http://127.0.0.1:4181'
const chromePort = 9223
const wait = (ms) => new Promise((resolve) => globalThis.setTimeout(resolve, ms))
async function waitFor(url) {
  for (let count = 0; count < 60; count++) {
    try { if ((await globalThis.fetch(url)).ok) return } catch { /* Process is still starting. */ }
    await wait(500)
  }
  throw new Error(`Serviço não iniciou em ${url}`)
}
const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4181', '--strictPort'], { stdio: 'ignore', windowsHide: true })
let browser
const runs = []
const thresholds = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 90 }
try {
  browser = await chromium.launch({ headless: true, args: [`--remote-debugging-port=${chromePort}`] })
  await mkdir(output, { recursive: true })
  await waitFor(baseUrl); await waitFor(`http://127.0.0.1:${chromePort}/json/version`)
  for (const page of [{ name: 'inicio', path: '/' }, { name: 'detalhe', path: '/nft/nft-1' }]) {
    for (const formFactor of ['mobile', 'desktop']) {
      for (let iteration = 1; iteration <= 3; iteration++) {
        const result = await lighthouse(`${baseUrl}${page.path}`, { port: chromePort, output: ['html', 'json'], logLevel: 'error', onlyCategories: Object.keys(thresholds) }, { extends: 'lighthouse:default', settings: {
          ...(formFactor === 'desktop' ? desktopConfig.settings : {}),
          formFactor, screenEmulation: formFactor === 'desktop' ? { mobile: false, width: 1440, height: 1000, deviceScaleFactor: 1, disabled: false } : { mobile: true, width: 390, height: 844, deviceScaleFactor: 1, disabled: false },
          throttlingMethod: 'simulate',
        } })
        if (!result) throw new Error('Lighthouse não retornou um resultado')
        const prefix = `${output}/${page.name}-${formFactor}-${iteration}`
        await writeFile(`${prefix}.html`, result.report[0]); await writeFile(`${prefix}.json`, result.report[1])
        const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([name, category]) => [name, Math.round((category.score ?? 0) * 100)]))
        const metrics = Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time'].map((name) => [name, result.lhr.audits[name]?.numericValue]))
        runs.push({ page: page.name, formFactor, iteration, scores, metrics, lighthouseVersion: result.lhr.lighthouseVersion })
        console.log(page.name, formFactor, iteration, scores)
      }
    }
  }
  const groups = [...new Set(runs.map((run) => `${run.page}/${run.formFactor}`))]
  const medians = groups.map((group) => {
    const values = runs.filter((run) => `${run.page}/${run.formFactor}` === group)
    const scores = Object.fromEntries(Object.keys(thresholds).map((name) => [name, values.map((run) => run.scores[name]).sort((a, b) => a - b)[1]]))
    const metrics = Object.fromEntries(Object.keys(values[0].metrics).map((name) => [name, values.map((run) => run.metrics[name]).sort((a, b) => a - b)[1]]))
    return { group, scores, metrics, meetsTargets: Object.entries(thresholds).every(([name, threshold]) => scores[name] >= threshold) }
  })
  await writeFile(`${output}/summary.json`, JSON.stringify({ environment: { node: process.version, chromium: browser.version(), platform: platform(), release: release(), cpu: cpus()[0]?.model, date: new Date().toISOString(), throttling: 'Lighthouse mobileSlow4G / desktopDense4G, simulate', viewports: '390×844 e 1440×1000' }, thresholds, medians, runs }, null, 2))
  console.log(JSON.stringify(medians, null, 2))
} finally { await browser?.close(); preview.kill() }
