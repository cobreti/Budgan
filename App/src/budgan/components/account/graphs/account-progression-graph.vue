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
import type { BdgAccountBalanceSnapshot, BdgAccountReferenceBalance } from '@engine/modules/bdg-workspace/bdg-account.ts'
import type { BdgAccountSegment } from '@engine/modules/bdg-workspace/bdg-account-segment.ts'
import { TransactionIterator } from '@engine/modules/transaction-iterator/transaction-iterator'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const props = defineProps<{
  segments: BdgAccountSegment[]
  referenceBalance: BdgAccountReferenceBalance | null
  balanceSnapshot: BdgAccountBalanceSnapshot | null
}>()
const { t } = useI18n()

const _style = getComputedStyle(document.documentElement)
// Vuetify stores theme colors as raw space-separated RGB channels, e.g. "24 103 192".
// CSS custom properties are returned verbatim by getPropertyValue (no variable resolution),
// so we read the base channel variables and build concrete color strings for canvas.
const _primary = _style.getPropertyValue('--v-theme-primary').trim().replace(/ /g, ', ')
const _onSurface = _style.getPropertyValue('--v-theme-on-surface').trim().replace(/ /g, ', ')
const _success = _style.getPropertyValue('--v-theme-success').trim().replace(/ /g, ', ')
const chartLineColor = `rgb(${_primary})`
const chartFillColor = `rgba(${_primary}, 0.13)`
const chartGridColor = `rgba(${_onSurface}, 0.10)`
const chartSnapshotColor = `rgb(${_success})`

type GraphPoint = { label: string; balance: number; isSnapshot: boolean }

const sortedPoints = computed((): GraphPoint[] => {
  const points: GraphPoint[] = []
  const iterator = new TransactionIterator(props.segments, props.referenceBalance, props.balanceSnapshot)

  for (const item of iterator) {
    if (item.kind === 'start') {
      points.push({ label: item.dateAsString, balance: item.amount, isSnapshot: false })
    } else if (item.kind === 'transaction') {
      points.push({ label: item.row.dateInscriptionAsString, balance: item.runningBalance, isSnapshot: false })
    } else {
      points.push({ label: item.dateAsString, balance: item.amount, isSnapshot: true })
    }
  }

  return points
})

const hasData = computed(() =>
  props.segments
    .flatMap((s) => s.rows)
    .some((r) => !r.duplicateOf && r.dateInscription instanceof Date),
)

const snapshotPointData = computed(() => {
  if (!props.balanceSnapshot) return null
  return sortedPoints.value.map((p) => (p.isSnapshot ? p.balance : null))
})

const chartData = computed<ChartData<'line'>>(() => {
  const labels = sortedPoints.value.map((p) => p.label)
  const datasets: ChartData<'line'>['datasets'] = [
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
  ]

  if (snapshotPointData.value) {
    datasets.push({
      label: t('account.progressionGraph.balanceSnapshot'),
      data: snapshotPointData.value,
      borderColor: chartSnapshotColor,
      backgroundColor: chartSnapshotColor,
      pointRadius: 7,
      pointHoverRadius: 9,
      pointStyle: 'rectRot',
      showLine: false,
    })
  }

  return { labels, datasets }
})

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
        label: (ctx) => {
          const value = (ctx.parsed.y ?? 0).toFixed(2)
          if (ctx.datasetIndex === 1) return ` ${t('account.progressionGraph.balanceSnapshot')}: ${value}`
          return ` ${value}`
        },
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
