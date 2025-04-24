import { HashRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '@/pages/AppLayout'
import ErrorBoundary from '@/pages/ErrorBoundary'
import DownloadingService from '@/pages/onbording/DownloadingService'
import ModeSelection from '@/pages/onbording/ModeSelection'
import KnowledgeNew from '@/pages/knowledge/KnowledgeNew'
import NoteDetail from '@/pages/note/NoteDetail'
import ConversationDetail from '@/pages/chat/ConversationDetail'
import KnowledgeDetail from '@/pages/knowledge/KnowledgeDetail'
import { EnumRouterLink } from '@/constants/paths'
import NoteNew from '@/pages/note/NoteNew'
import NotFound from '@/pages/NotFound'
import ConversationNew from '@/pages/chat/ConversationNew'
import RootLayout from '@/pages/RootLayout'
import CheckPoint from '@/pages/CheckPoint'
import LanguageSelection from '@/pages/onbording/LanguageSelection'
export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<RootLayout />} errorElement={<ErrorBoundary />}>
          <Route path={EnumRouterLink.Home} element={<CheckPoint />}></Route>
          <Route element={<AppLayout />}>
            {/* Conversation */}
            <Route path={EnumRouterLink.ConversationNew} element={<ConversationNew />}></Route>
            <Route path={EnumRouterLink.ConversationDetail} element={<ConversationDetail />}></Route>
            {/* Note */}
            <Route path={EnumRouterLink.NoteDetail} element={<NoteDetail />}></Route>
            <Route path={EnumRouterLink.NoteNew} element={<NoteNew />}></Route>
            {/* Knowledge */}
            <Route path={EnumRouterLink.KnowledgeNew} element={<KnowledgeNew />}></Route>
            <Route path={EnumRouterLink.KnowledgeDetail} element={<KnowledgeDetail />}></Route>
          </Route>

          <Route path={EnumRouterLink.DownloadingService} element={<DownloadingService />}></Route>
          <Route path={EnumRouterLink.ModeSelection} element={<ModeSelection />}></Route>
          <Route path={EnumRouterLink.LanguageSelection} element={<LanguageSelection />}></Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
