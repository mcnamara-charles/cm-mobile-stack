import { format } from 'date-fns'
import { MessageWithAttachments } from '../services/api/messages'

type Message = MessageWithAttachments

export type FlatListItem =
  | { type: 'date'; date: string }
  | { type: 'group'; messages: Message[] }

export function groupMessagesByDayAndTime(messages: Message[]) {
  const dayGroups: { date: string; groups: Message[][] }[] = []

  messages.forEach((message) => {
    const messageDate = format(new Date(message.created_at), 'yyyy-MM-dd')
    let existingDayGroup = dayGroups.find(day => day.date === messageDate)

    if (existingDayGroup) {
      // Try to add to existing groups in this day
      let addedToGroup = false
      
      for (let i = existingDayGroup.groups.length - 1; i >= 0; i--) {
        const group = existingDayGroup.groups[i]
        if (group.length > 0) {
          const lastMessage = group[group.length - 1]
          const timeDiff = Math.abs(new Date(message.created_at).getTime() - new Date(lastMessage.created_at).getTime())
          const fiveMinutes = 5 * 60 * 1000

          // Group by time only
          if (timeDiff <= fiveMinutes) {
            group.push(message)
            addedToGroup = true
            break
          }
        }
      }
      
      // If not added to any existing group, create new group
      if (!addedToGroup) {
        existingDayGroup.groups.push([message])
      }
    } else {
      // New day
      dayGroups.push({
        date: messageDate,
        groups: [[message]]
      })
    }
  })

  return dayGroups
}

export function getFlatListItems(messages: Message[]): FlatListItem[] {
  const items: FlatListItem[] = []
  const groupedByDay = groupMessagesByDayAndTime(messages)

  groupedByDay.forEach(day => {
    items.push({ type: 'date', date: day.date })
    day.groups.forEach(group => {
      items.push({ type: 'group', messages: group })
    })
  })

  return items.reverse() // Because FlatList is inverted
}

export function formatMessageDate(date: Date): string {
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  return isToday 
    ? format(date, 'h:mm a') 
    : format(date, 'MMMM do, h:mm a')
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
} 