import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function QuickActions({ actions }: { actions: any[] }) {
  return (
    <div className="dark:bg-gray-800 rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            asChild
            variant="outline"
            className="h-24 flex flex-col gap-2"
          >
            <Link href={action.action}>
              {action.icon}
              <span>{action.title}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}