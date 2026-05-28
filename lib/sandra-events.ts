export type SandraAskEventDetail = string | {
  message: string
  submit?: boolean
}

export type SandraAskEvent = Event & {
  detail?: SandraAskEventDetail
}

export function dispatchSandraAsk(detail: SandraAskEventDetail) {
  const event = new Event("sandra:ask") as SandraAskEvent
  event.detail = detail
  window.dispatchEvent(event)
}
