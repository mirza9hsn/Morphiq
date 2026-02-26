import React from 'react'
import HistoryPill from './history'
import ZoomBar from './zoom'
import ToolBarShapes from './shapes'

export default function Toolbar() {
    return (
        <div className="fixed bottom-0 w-full grid grid-cols-3 z-50 p-5">
            <HistoryPill />
            <ToolBarShapes />
            <ZoomBar />
        </div>
    )
}
