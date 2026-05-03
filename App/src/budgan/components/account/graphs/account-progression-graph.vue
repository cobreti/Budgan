<template>
  <div class="account-progression-graph" data-testid="account-progression-graph">
    <h2 class="account-progression-graph__title">{{ t('account.progressionGraph.title') }}</h2>
    <div v-if="hasData" class="account-progression-graph__chart-wrap">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="account-progression-graph__empty" data-testid="account-progression-graph-empty">
      {{ t('account.progressionGraph.noData') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { useI18n } from 'vue-i18n'
import type { BdgAccountSegment } from '@engine/modules/bdg-workspace/bdg-account-segment.ts'
import type { BdgAccountReferenceBalance } from '@engine/modules/bdg-workspace/bdg-account.ts'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const props = defineProps<{
  segments: BdgAccountSegment[]
  referenceBalance: BdgAccountReferenceBalance | null
}>()
const { t } = useI18n()

const _style = getComputedStyle(document.documentElement)
// Vuetify stores theme colors as raw space-separated RGB channels, e.g. "24 103 192".
// CSS custom properties are returned verbatim by getPropertyValue (no variable resolution),
// so we read the base channel variables and build concrete color strings for canvas.
const _primary = _style.getPropertyValue('--v-theme-primary').trim().replace(/ /g, ', ')
const _onSurface = _style.getPropertyValue('--v-theme-on-surface').trim().replace(/ /g, ', ')
const chartLineColor = `rgb(${_primary})`
const chartFillColor = `rgba(${_primary}, 0.13)`
const chartGridColor = `rgba(${_onSurface}, 0.10)`

const sortedPoints = computed(() => {
  const rows = props.segments
    .flatMap((s) => s.rows)
    .filter((r) => !r.duplicateOf && r.dateInscription instanceof Date)

  rows.sort((a, b) => a.dateInscription!.getTime() - b.dateInscription!.getTime())

  const points: { label: string; balance: number }[] = []
  let balance = props.referenceBalance?.amount ?? 0

  if (props.referenceBalance) {
    points.push({ label: props.referenceBalance.dateAsString, balance: props.referenceBalance.amount })
  }

  for (const r of rows) {
    balance += r.amount
    points.push({ label: r.dateInscriptionAsString, balance: Math.round(balance * 100) / 100 })
  }

  return points
})

const hasData = computed(() =>
  props.segments
    .flatMap((s) => s.rows)
    .some((r) => !r.duplicateOf && r.dateInscription instanceof Date),
)

const chartData = computed<ChartData<'line'>>(() => ({
  labels: sortedPoints.value.map((p) => p.label),
  datasets: [
    {
      label: t('account.progressionGraph.balance'),
      data: sortedPoints.value.map((p) => p.balance),
      borderColor: chartLineColor,
      backgroundColor: chartFillColor,
      fill: true,
      tension: 0.3,
      pointRadius: sortedPoints.value.length > 100 ? 0 : 3,
      pointHoverRadius: 5,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${(ctx.parsed.y ?? 0).toFixed(2)}`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxTicksLimit: 8,
        maxRotation: 0,
      },
      grid: { display: false },
    },
    y: {
      grid: { color: chartGridColor },
    },
  },
}))
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.account-progression-graph {
  background-color: var(--bdg-surface);
  border: 1px solid var(--bdg-secondary);
  border-radius: 12px;
  padding: 1.25rem;
  max-height: 30em;
  overflow: hidden;
  color: var(--bdg-on-surface);
}

.account-progression-graph__title {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.account-progression-graph__chart-wrap {
  position: relative;
  height: calc(30em - 4.5rem);
}

.account-progression-graph__empty {
  margin: 0;
  opacity: 0.6;
  font-size: 0.875rem;
}
</style>
