"use client"

type Bot = {
  id: string
  name: string
}

interface StyledBotSelectorProps {
  bots: Bot[]
  value: string | null
  onValueChange: (value: string) => void
  name: string
}

export const StyledBotSelector: React.FC<StyledBotSelectorProps> = ({
  bots,
  value,
  onValueChange,
  name,
}) => {
  return (
    <>
      <div className="selector">
        {bots.map((bot) => (
          <div className="choice" key={bot.id}>
            <div>
              <input
                className="choice-circle"
                checked={value === bot.id}
                value={bot.id}
                name={name}
                id={`bot-${bot.id}`}
                type="radio"
                onChange={() => onValueChange(bot.id)}
              />
              <div className="ball"></div>
            </div>
            <label htmlFor={`bot-${bot.id}`} className="choice-name">
              {bot.name}
            </label>
          </div>
        ))}
      </div>

      <style jsx>{`
        .choice {
          margin: 10px 0 10px 0;
          display: flex;
          align-items: center;
        }

        .choice > div {
          position: relative;
          width: 41px;
          height: 41px;
          margin-right: 15px;
          z-index: 0;
          flex-shrink: 0;
        }

        .choice-circle {
          appearance: none;
          height: 100%;
          width: 100%;
          border-radius: 100%;
          border-width: 9px;
          border-style: solid;
          border-color: hsl(var(--border) / 0.45);
          cursor: pointer;
          box-shadow:
            0px 0px 20px -13px hsl(var(--foreground) / 0.2),
            0px 0px 20px -14px hsl(var(--foreground) / 0.2) inset;
          transition: border-color 0.2s;
        }

        .choice-circle:hover {
          border-color: hsl(var(--primary) / 0.5);
        }

        .ball {
          z-index: 1;
          position: absolute;
          inset: 0px;
          transform: translateX(-95px);
          box-shadow:
            rgba(0, 0, 0, 0.17) 0px -10px 10px 0px inset,
            rgba(0, 0, 0, 0.15) 0px -15px 15px 0px inset,
            rgba(0, 0, 0, 0.1) 0px -40px 20px 0px inset,
            rgba(0, 0, 0, 0.06) 0px 2px 1px,
            rgba(0, 0, 0, 0.09) 0px 4px 2px,
            rgba(0, 0, 0, 0.09) 0px 8px 4px,
            rgba(0, 0, 0, 0.09) 0px 16px 8px,
            rgba(0, 0, 0, 0.09) 0px 32px 16px,
            0px -1px 15px -8px rgba(0, 0, 0, 0.09);
          border-radius: 100%;
          transition: 1000ms cubic-bezier(1, -0.4, 0, 1.4);
          background-color: #eee;
          opacity: 0;
          filter: blur(10px);
        }

        .dark .ball {
          background-color: #ccc;
        }

        .choice-circle:checked + .ball {
          transform: translateX(0px);
          opacity: 1;
          filter: blur(0);
        }

        .choice-name {
          color: rgb(177, 176, 176);
          font-size: 20px;
          font-weight: 900;
          font-family: monospace;
          cursor: pointer;
          word-break: break-all;
          transition: color 0.2s;
        }

        .dark .choice-name {
          color: rgb(150, 150, 150);
        }

        .choice:has(.choice-circle:checked) .choice-name {
          color: hsl(var(--primary));
        }
      `}</style>
    </>
  )
}