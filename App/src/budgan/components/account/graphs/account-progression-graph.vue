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
import { computed, onMounted, ref } from 'vue'
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const props = defineProps<{ segments: BdgAccountSegment[] }>()
const { t } = useI18n()

const primaryColor = ref('#1867c0')

onMounted(() => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--bdg-primary')
    .trim()
  if (value) primaryColor.value = value
})

const sortedPoints = computed(() => {
  const rows = props.segments
    .flatMap((s) => s.rows)
    .filter((r) => !r.duplicateOf && r.dateTransaction instanceof Date)

  rows.sort((a, b) => a.dateTransaction!.getTime() - b.dateTransaction!.getTime())

  let balance = 0
  return rows.map((r) => {
    balance += r.amount
    return {
      label: r.dateTransactionAsString,
      balance: Math.round(balance * 100) / 100,
    }
  })
})

const hasData = computed(() => sortedPoints.value.length > 0)

const chartData = computed<ChartData<'line'>>(() => ({
  labels: sortedPoints.value.map((p) => p.label),
  datasets: [
    {
      label: t('account.progressionGraph.balance'),
      data: sortedPoints.value.map((p) => p.balance),
      borderColor: primaryColor.value,
      backgroundColor: primaryColor.value + '22',
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
      grid: { color: 'rgba(128,128,128,0.15)' },
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
