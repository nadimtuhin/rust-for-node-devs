import json

with open("/Users/nadimtuhin/opensource/rust-for-node-devs/src/data/chapters.ts", "r") as f:
    # Read chapters
    pass

from build_full_curriculum import chapters

# Group by part
parts = {}
for key, ch in chapters.items():
    part = ch["part"]
    if part not in parts:
        parts[part] = []
    parts[part].append((key, ch))

sidebar_items = []
sidebar_items.append("""---
// Sidebar Navigation Component
interface Props {
  activeKey?: string;
}
const { activeKey = 'basic_vars' } = Astro.props;
---
<aside class="sidebar" id="sidebar" role="region" aria-label="Curriculum Navigation">
  <div class="sidebar-header">
    <div class="sidebar-search-box">
      <span class="search-icon" aria-hidden="true">🔍</span>
      <input 
        type="search" 
        id="lessonSearchInput" 
        class="lesson-search-input" 
        placeholder="Filter 56 chapters... (⌘+K)" 
        aria-label="Filter 56 curriculum chapters by title, description or code"
        oninput="filterLessons(this.value)"
      />
      <button 
        type="button" 
        id="clearSearchBtn" 
        class="search-clear-btn" 
        onclick="clearLessonSearch()" 
        aria-label="Clear chapter search query"
        style="display:none;"
      >✕</button>
    </div>
  </div>

  <div class="sidebar-nav-container">
    <div id="noResultsNotice" class="no-results-notice" style="display:none;" role="status">
      <span>No chapters found matching query.</span>
    </div>
    <nav class="sidebar-nav" id="sidebarNav" role="navigation" aria-label="Course Lessons">
""")

for part_name, ch_list in parts.items():
    sidebar_items.append(f'      <div class="sidebar-part-label">{part_name}</div>\n')
    for key, ch in ch_list:
        sidebar_items.append(f"""      <div class="chapter-nav-item" role="button" tabindex="0" aria-label="Select lesson {key}" data-id="{key}" onclick="selectChapter('{key}')" onkeydown="if(event.key==='Enter'||event.key===' '){{event.preventDefault();selectChapter('{key}');}}">
        <span class="chapter-num">{ch['num']}</span>
        <span>{ch['title']}</span>
      </div>\n""")

sidebar_items.append("""      <div class="sidebar-appendices-footer">
        <a href="/chapters" class="sidebar-appendices-link">
          <span>📚 Book Index & Appendices (13)</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </nav>
  </div>
</aside>
""")

with open("/Users/nadimtuhin/opensource/rust-for-node-devs/src/components/Sidebar.astro", "w") as f:
    f.write("".join(sidebar_items))

print("Generated src/components/Sidebar.astro successfully!")
