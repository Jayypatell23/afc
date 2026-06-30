interface Step {
  label: string
  completed: boolean
}

interface OrderTrackerProps {
  steps: Step[]
}

export default function OrderTracker({ steps }: OrderTrackerProps) {
  return (
    <ol className="relative flex flex-col gap-0" aria-label="Order progress">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <li key={step.label} className="flex items-start gap-4">
            {/* Dot + line */}
            <div className="flex flex-col items-center shrink-0">
              <span
                className="inline-block rounded-full"
                style={{
                  width: 14,
                  height: 14,
                  border: `2px solid ${step.completed ? "#a8492f" : "#d3c7af"}`,
                  background: step.completed ? "#a8492f" : "transparent",
                  marginTop: 3,
                }}
                aria-hidden="true"
              />
              {!isLast && (
                <span
                  className="w-px mt-1"
                  style={{
                    height: 36,
                    background: step.completed ? "#a8492f" : "#e6dcc8",
                  }}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Label */}
            <p
              className="font-sans text-sm pb-5"
              style={{
                color: step.completed ? "#241f1b" : "#9a8d79",
                fontWeight: step.completed ? 600 : 400,
              }}
            >
              {step.label}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
