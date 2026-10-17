import { Move3d } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Spinner } from '@/components/ui/PageLoader'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface PanoramaTourProps {
  panorama: string
  roomName: string
}

/** Small preview of the panorama, shown until the visitor starts the tour. */
const previewOf = (panorama: string) => panorama.replace(/\.jpg$/, '-small.jpg')

/**
 * 360° tour of the room. The viewer (three.js, ~600 kB) is only downloaded when the visitor
 * presses "Start the tour", so the room page stays fast for everyone else.
 */
export function PanoramaTour({ panorama, roomName }: PanoramaTourProps) {
  const container = useRef<HTMLDivElement>(null)
  // `started` creates the viewer once; `state` only drives what is shown on top of it.
  // (Depending on `state` here would destroy the viewer as soon as it reports "ready".)
  const [started, setStarted] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    if (!started || !container.current) return
    let viewer: { destroy: () => void } | undefined
    let cancelled = false

    Promise.all([
      import('@photo-sphere-viewer/core'),
      import('@photo-sphere-viewer/core/index.css'),
    ])
      .then(([{ Viewer }]) => {
        if (cancelled || !container.current) return
        const instance = new Viewer({
          container: container.current,
          panorama,
          caption: `${roomName} · 360° view`,
          navbar: ['zoom', 'move', 'caption', 'fullscreen'],
          defaultZoomLvl: 10,
          mousewheelCtrlKey: true, // let the page scroll normally over the viewer
          touchmoveTwoFingers: true,
        })
        instance.addEventListener('ready', () => setState('ready'), { once: true })
        viewer = instance
      })
      .catch(() => {
        setState('error')
        setStarted(false)
      })

    return () => {
      cancelled = true
      viewer?.destroy()
    }
  }, [started, panorama, roomName])

  return (
    <section className="bg-forest section-y text-sand">
      <div className="container-site space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <Eyebrow>The view 360°</Eyebrow>
            <h2 className="text-heading text-cream">Step Inside</h2>
          </div>
          <p className="max-w-[380px]">
            Look around {roomName} before you arrive. Drag to explore, use the controls to zoom or
            go full screen.
          </p>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black md:aspect-[16/8]">
          {state === 'idle' || state === 'error' ? (
            <>
              <img
                src={previewOf(panorama)}
                alt=""
                className="size-full object-cover opacity-70"
                loading="lazy"
              />
              <div className="absolute inset-0 grid place-items-center">
                <button
                  type="button"
                  onClick={() => {
                    setState('loading')
                    setStarted(true)
                  }}
                  className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/70 bg-black/30 px-6 py-3 text-button text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Move3d className="size-5" strokeWidth={1.5} />
                  {state === 'error' ? 'Try the tour again' : 'Start the 360° tour'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div ref={container} className="size-full" />
              {state === 'loading' && (
                <div className="absolute inset-0 grid place-items-center bg-black/40">
                  <Spinner className="size-8" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
