from build_full_curriculum import chapters

parts = {}
for key, ch in chapters.items():
    part = ch["part"]
    if part not in parts:
        parts[part] = []
    parts[part].append((key, ch))

out = []
out.append("""---
// Sidebar Component
interface Props {
  chapterKey?: string;
  activeKey?: string;
}
const { chapterKey = 'basic_vars', activeKey = 'basic_vars' } = Astro.props;
const currentKey = chapterKey || activeKey;
---
<nav class="chapters-sidebar" id="chaptersList">
  <div class="sidebar-header-box">
    <div class="sidebar-title-row">
      <div style="display: flex; align-items: center; gap: 0.4rem;">
        <span class="sidebar-title">📖 Table of Contents</span>
        <span class="sidebar-badge-count" id="sidebarCountBadge">56 Chapters</span>
      </div>
      <button id="sidebarCollapseBtn" class="sidebar-collapse-btn" onclick="toggleSidebar()" aria-label="Collapse Table of Contents sidebar" title="Collapse sidebar">◀</button>
    </div>
    <div class="sidebar-search-box" role="search">
      <input type="search" id="lessonSearchInput" aria-label="Search lessons by title or keyword" placeholder="Filter 56 chapters... (⌘+K)" oninput="filterLessons(this.value)">
      <button id="clearSearchBtn" aria-label="Clear lesson search query" class="clear-search-btn" onclick="clearLessonSearch()" style="display:none;">✕</button>
    </div>
  </div>
""")

for part_name, ch_list in parts.items():
    out.append(f'  <div class="sidebar-part-label">{part_name}</div>\n')
    for key, ch in ch_list:
        out.append(f"""  <div class={{`chapter-nav-item ${{currentKey === '{key}' ? 'active' : ''}}`}} role="button" tabindex="0" aria-label="Select lesson {key}" data-id="{key}" onclick="selectChapter('{key}')" onkeydown="if(event.key==='Enter'||event.key===' '){{event.preventDefault();selectChapter('{key}');}}">
    <span class="chapter-num">{ch['num']}</span>
    <span>{ch['title']}</span>
  </div>\n""")

out.append("""  <div class="sidebar-appendices-footer" style="padding: 1rem; border-top: 1px solid var(--border);">
    <a href="/chapters" class="sidebar-appendices-link" style="color: #b7410e; font-weight: 700; text-decoration: none; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
      <span>📚 Book Index & Appendices (13)</span>
      <span aria-hidden="true">→</span>
    </a>
  </div>
</nav>
""")

with open("/Users/nadimtuhin/opensource/rust-for-node-devs/src/components/Sidebar.astro", "w") as f:
    f.write("".join(out))

print("Regenerated Sidebar.astro successfully!")
