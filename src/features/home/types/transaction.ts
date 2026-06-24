export interface TxItem {
  id: number
  name: string
  label: string
  time: string
  amount: number
  balance?: number
  type: '입금' | '출금' | '체크카드' | '환전'
}

export interface TxGroup {
  date: string
  items: TxItem[]
}
