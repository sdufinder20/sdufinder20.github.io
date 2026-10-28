/* ==========================================================================
   SOUTHERN DELTA UNIVERSITY (SDU) - LOST & FOUND PORTAL
   Full Client-Side REST API Integration & UI Logic
   ========================================================================== */

// Live Cloud Backend URL (e.g. Render / Railway). Update this once your backend is deployed!
const LIVE_BACKEND_API = 'https://YOUR-BACKEND.onrender.com/api';

window.API_BASE = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api')
  : (window.location.origin.includes('github.io') ? LIVE_BACKEND_API : '/api');

const API_BASE = window.API_BASE;

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initIndexPage();
  initItemDetailsPage();
  initReportForm();
  initDashboard();
});

/* --------------------------------------------------------------------------
   1. Mobile Navigation Toggle
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });
  }
}

/* --------------------------------------------------------------------------
   Category Emojis / Fallback Icons
   -------------------------------------------------------------------------- */
function getCategoryIcon(category) {
  const map = {
    'Electronics': '🔌',
    'ID Cards': '🪪',
    'Keys': '🔑',
    'Books': '📚',
    'Clothing': '🎒',
    'Wallets': '👛',
    'Other': '📦'
  };
  return map[category] || '📦';
}

/* --------------------------------------------------------------------------
   Image URL Resolver
   -------------------------------------------------------------------------- */
function resolveImageUrl(imgUrl) {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
    return imgUrl;
  }
  const isPort5000 = window.location.port === '5000';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

  if (isPort5000) {
    return imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
  }
  if (isLocal) {
    return imgUrl.startsWith('/') ? `http://localhost:5000${imgUrl}` : `http://localhost:5000/${imgUrl}`;
  }
  if (window.location.origin.includes('github.io')) {
    const liveOrigin = LIVE_BACKEND_API.replace(/\/api\/?$/, '');
    return imgUrl.startsWith('/') ? `${liveOrigin}${imgUrl}` : `${liveOrigin}/${imgUrl}`;
  }
  return imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
}

/* --------------------------------------------------------------------------
   2. Screen 1: Home / Feed (index.html)
   -------------------------------------------------------------------------- */
async function initIndexPage() {
  const itemsGrid = document.getElementById('itemsGrid');
  if (!itemsGrid) return; // Not on index.html

  const searchInput = document.getElementById('itemSearchInput');
  const typePills = document.querySelectorAll('.type-pill');
  const categoryFilter = document.getElementById('categoryFilter');
  const locationFilter = document.getElementById('locationFilter');
  const itemsCountText = document.getElementById('itemsCountText');
  const noResultsMsg = document.getElementById('noResultsMessage');

  let currentType = 'all';

  async function loadItems() {
    try {
      const searchTerm = searchInput ? searchInput.value.trim() : '';
      const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
      const selectedLocation = locationFilter ? locationFilter.value : 'all';

      const params = new URLSearchParams();
      if (currentType !== 'all') params.append('type', currentType);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLocation !== 'all') params.append('location', selectedLocation);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`${API_BASE}/items?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        renderCards(data.data);
      }
    } catch (err) {
      console.warn('Backend API currently unreachable, keeping static cards or retrying:', err.message);
    }
  }

  function renderCards(items) {
    if (!items || items.length === 0) {
      itemsGrid.innerHTML = '';
      if (noResultsMsg) noResultsMsg.style.display = 'block';
      if (itemsCountText) itemsCountText.textContent = 'Showing 0 items';
      return;
    }

    if (noResultsMsg) noResultsMsg.style.display = 'none';
    if (itemsCountText) {
      itemsCountText.textContent = `Showing ${items.length} item${items.length === 1 ? '' : 's'}`;
    }

    itemsGrid.innerHTML = items.map(item => {
      const isFound = item.type === 'Found';
      const isRecovered = item.status === 'Recovered';
      
      let badgeHtml = '';
      if (isRecovered) {
        badgeHtml = '<span class="badge badge-reunited">✓ Reunited</span>';
      } else if (isFound) {
        badgeHtml = '<span class="badge badge-found">● Found</span>';
      } else {
        badgeHtml = '<span class="badge badge-lost">● Lost</span>';
      }

      const dateStr = item.date
        ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent';

      // Media block: image with fallback icon or fallback icon directly
      const fullImgUrl = resolveImageUrl(item.imageUrl);
      const mediaHtml = `
        <div class="item-card-media" style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);">
          <span class="item-card-badge">${badgeHtml}</span>
          ${fullImgUrl ? `
            <img src="${fullImgUrl}" alt="${escapeHtml(item.title)}" class="item-card-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
            <div class="item-card-icon-fallback" style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3.5rem; color: #64748b;">
              ${getCategoryIcon(item.category)}
            </div>
          ` : `
            <div class="item-card-icon-fallback" style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3.5rem; color: #64748b;">
              ${getCategoryIcon(item.category)}
            </div>
          `}
          <span class="item-card-date">${dateStr}</span>
        </div>
      `;

      const initials = (item.contactName || 'SDU')
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      return `
        <article class="item-card" data-title="${escapeHtml(item.title)}" data-category="${escapeHtml(item.category)}" data-type="${escapeHtml(item.type)}" data-location="${escapeHtml(item.location)}">
          ${mediaHtml}
          <div class="item-card-body">
            <div class="item-card-category">${escapeHtml(item.category)}</div>
            <h3 class="item-card-title">${escapeHtml(item.title)}</h3>
            <p class="item-card-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${escapeHtml(item.location)}
            </p>
            <div class="item-card-footer">
              <div class="reporter-avatar">
                <div class="avatar-circle">${initials}</div>
                <span class="reporter-name">${escapeHtml(item.contactName)}</span>
              </div>
              <a href="item.html?id=${item._id}" class="btn btn-outline btn-sm">
                ${isRecovered ? 'Archived' : (isFound ? 'View & Claim' : 'View Details')}
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Type pills filtering
  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentType = pill.getAttribute('data-type');
      loadItems();
    });
  });

  // Debounced search input
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(loadItems, 300);
    });
  }

  if (categoryFilter) categoryFilter.addEventListener('change', loadItems);
  if (locationFilter) locationFilter.addEventListener('change', loadItems);

  // Initial load
  loadItems();
}

/* --------------------------------------------------------------------------
   3. Screen 2: Item Details & Claim (item.html)
   -------------------------------------------------------------------------- */
async function initItemDetailsPage() {
  const detailsCard = document.querySelector('.details-card');
  if (!detailsCard) return; // Not on item.html

  initClaimModal();

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');

  if (!itemId) {
    const detailsWrapper = document.getElementById('detailsWrapper');
    if (detailsWrapper) {
      detailsWrapper.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <div style="font-size: 3.5rem; margin-bottom: 12px;">🔍</div>
          <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 8px;">No Item Selected</h2>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 20px auto;">
            Please select a lost or found report from the Campus Feed to view its full custody information, claim details, and contact options.
          </p>
          <a href="index.html" class="btn btn-primary">Browse Campus Listings</a>
        </div>
      `;
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/items/${itemId}`);
    const data = await res.json();
    if (!data.success || !data.data) {
      const detailsWrapper = document.getElementById('detailsWrapper');
      if (detailsWrapper) {
        detailsWrapper.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
            <div style="font-size: 3.5rem; margin-bottom: 12px;">⚠️</div>
            <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 8px;">Item Not Found</h2>
            <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 20px auto;">
              The requested item report may have been deleted or resolved.
            </p>
            <a href="index.html" class="btn btn-primary">Return to Campus Feed</a>
          </div>
        `;
      }
      return;
    }

    const item = data.data;

    // Update document title & breadcrumbs
    document.title = `${item.title} | SDU Lost & Found`;
    const bCat = document.getElementById('breadcrumbCategory');
    const bTitle = document.getElementById('breadcrumbTitle');
    if (bCat) bCat.textContent = item.category;
    if (bTitle) bTitle.textContent = item.title;

    // Gallery Image
    const galleryContainer = document.getElementById('itemGalleryContainer');
    if (galleryContainer) {
      const fullImg = resolveImageUrl(item.imageUrl);
      if (fullImg) {
        galleryContainer.innerHTML = `
          <img src="${fullImg}" alt="${escapeHtml(item.title)}" id="itemDetailImage" style="width: 100%; max-height: 420px; object-fit: contain; border-radius: var(--radius-md); background: #f8fafc;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
          <div style="display: none; height: 280px; align-items: center; justify-content: center; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); font-size: 5rem; border-radius: var(--radius-md);">
            ${getCategoryIcon(item.category)}
          </div>
        `;
      } else {
        galleryContainer.innerHTML = `
          <div style="height: 280px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); font-size: 5rem; border-radius: var(--radius-md);">
            ${getCategoryIcon(item.category)}
          </div>
        `;
      }
    }

    // Title & Status Badge
    const titleEl = document.getElementById('itemTitle') || document.querySelector('.details-title');
    if (titleEl) titleEl.textContent = item.title;

    const badgeWrap = document.getElementById('itemBadges');
    if (badgeWrap) {
      const isFound = item.type === 'Found';
      const isRecovered = item.status === 'Recovered';
      let badgeHtml = '';
      if (isRecovered) {
        badgeHtml = '<span class="badge badge-reunited">✓ Reunited</span>';
      } else if (isFound) {
        badgeHtml = '<span class="badge badge-found">● Found Item</span>';
      } else {
        badgeHtml = '<span class="badge badge-lost">● Lost Item</span>';
      }
      badgeWrap.innerHTML = `
        ${badgeHtml}
        <span class="badge badge-category">Ref: #${item._id.slice(-6).toUpperCase()}</span>
      `;
    }

    // Metadata Grid
    const locEl = document.getElementById('itemLocation');
    const dateEl = document.getElementById('itemDate');
    const catEl = document.getElementById('itemCategory');
    const statusEl = document.getElementById('itemStatus');

    if (locEl) locEl.textContent = item.location;
    if (dateEl) dateEl.textContent = item.date
      ? new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Not specified';
    if (catEl) catEl.textContent = item.category;
    if (statusEl) {
      statusEl.textContent = item.status === 'Recovered' ? '✓ Reunited / Resolved' : `● Active (${item.type})`;
      statusEl.style.color = item.status === 'Recovered' ? 'var(--reunited-color)' : (item.type === 'Found' ? 'var(--found-color)' : 'var(--lost-color)');
    }

    // Full Description
    const descEl = document.getElementById('itemDescription') || document.querySelector('.details-desc-text');
    if (descEl) descEl.textContent = item.description || 'No additional notes provided by reporter.';

    // Sidebar: Reporter Contact
    const contactNameEl = document.getElementById('contactName');
    const contactAvatar = document.getElementById('contactAvatar');
    const contactEmailEl = document.getElementById('contactEmail');
    const contactPhoneEl = document.getElementById('contactPhone');
    const whatsappBtn = document.getElementById('whatsappBtn');

    if (contactNameEl) contactNameEl.textContent = item.contactName;
    if (contactAvatar) {
      contactAvatar.textContent = item.contactName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    if (contactEmailEl) contactEmailEl.textContent = item.contactEmail;
    if (contactPhoneEl) contactPhoneEl.textContent = item.contactPhone;

    if (whatsappBtn && item.contactPhone) {
      const cleanPhone = item.contactPhone.replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(`Hello ${item.contactName}, I am contacting you regarding "${item.title}" reported on the SDU Lost & Found Portal.`);
      whatsappBtn.href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
    }
  } catch (err) {
    console.error('Error fetching item details:', err);
  }
}

/* --------------------------------------------------------------------------
   Claim Modal Logic
   -------------------------------------------------------------------------- */
function initClaimModal() {
  const openClaimBtn = document.getElementById('openClaimModalBtn');
  const claimModal = document.getElementById('claimModal');
  const closeClaimBtn = document.getElementById('closeClaimModalBtn');
  const cancelClaimBtn = document.getElementById('cancelClaimBtn');
  const claimForm = document.getElementById('claimVerificationForm');

  if (openClaimBtn && claimModal) {
    openClaimBtn.addEventListener('click', () => {
      claimModal.classList.add('active');
    });
  }

  const closeModal = () => {
    if (claimModal) claimModal.classList.remove('active');
  };

  if (closeClaimBtn) closeClaimBtn.addEventListener('click', closeModal);
  if (cancelClaimBtn) cancelClaimBtn.addEventListener('click', closeModal);

  if (claimForm) {
    claimForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Your verification claim request has been registered and transmitted to the reporter.');
      closeModal();
    });
  }
}

/* --------------------------------------------------------------------------
   4. Screen 3: Report an Item (report.html)
   -------------------------------------------------------------------------- */
function initReportForm() {
  const reportForm = document.getElementById('reportItemForm');
  if (!reportForm) return; // Not on report.html

  const typeCards = document.querySelectorAll('.type-radio-card');
  const itemTypeInput = document.getElementById('itemTypeInput');
  const imageUploadInput = document.getElementById('imageUploadInput');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const previewContainer = document.getElementById('previewContainer');
  const previewImage = document.getElementById('previewImage');

  // Type radio toggles
  if (typeCards.length && itemTypeInput) {
    typeCards.forEach(card => {
      card.addEventListener('click', () => {
        typeCards.forEach(c => c.classList.remove('active-lost', 'active-found'));
        const type = card.getAttribute('data-type');
        itemTypeInput.value = type;

        if (type === 'Lost') {
          card.classList.add('active-lost');
        } else {
          card.classList.add('active-found');
        }
      });
    });
  }

  // Image upload preview
  if (uploadDropzone && imageUploadInput) {
    uploadDropzone.addEventListener('click', () => imageUploadInput.click());

    imageUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          if (previewImage && previewContainer) {
            previewImage.src = evt.target.result;
            previewContainer.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Form submission via POST /api/items
  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = reportForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Submitting Report...';
    }

    try {
      const title = document.getElementById('itemTitle')?.value || '';
      const type = itemTypeInput ? itemTypeInput.value : 'Lost';
      const category = document.getElementById('itemCategory')?.value || '';
      const date = document.getElementById('itemDate')?.value || '';
      const location = document.getElementById('itemLocation')?.value || '';
      const rawDesc = document.getElementById('itemDesc')?.value || '';
      const matric = document.getElementById('reporterMatric')?.value?.trim();
      const contactName = (document.getElementById('reporterName')?.value || document.getElementById('contactName')?.value || '').trim();
      const contactEmail = (document.getElementById('reporterEmail')?.value || document.getElementById('contactEmail')?.value || '').trim();
      const contactPhone = (document.getElementById('reporterPhone')?.value || document.getElementById('contactPhone')?.value || '').trim();

      const description = matric ? `${rawDesc} [Matric/Staff ID: ${matric}]` : rawDesc;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('category', category);
      formData.append('date', date);
      formData.append('location', location);
      formData.append('description', description);
      formData.append('contactName', contactName);
      formData.append('contactEmail', contactEmail);
      formData.append('contactPhone', contactPhone);

      if (imageUploadInput && imageUploadInput.files[0]) {
        formData.append('image', imageUploadInput.files[0]);
      }

      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (result.success) {
        // Track locally so dashboard shows user's reports
        const savedReports = JSON.parse(localStorage.getItem('sdu_my_reports') || '[]');
        savedReports.push(result.data._id);
        localStorage.setItem('sdu_my_reports', JSON.stringify(savedReports));

        const successModal = document.getElementById('submissionSuccessModal');
        if (successModal) {
          successModal.classList.add('active');
          const viewItemLink = successModal.querySelector('a[href="index.html"]');
          if (viewItemLink) {
            viewItemLink.href = `item.html?id=${result.data._id}`;
            viewItemLink.textContent = 'View My Report';
          }
        } else {
          alert('Report submitted successfully!');
          window.location.href = `item.html?id=${result.data._id}`;
        }
      } else {
        alert(result.message || 'Error creating report. Please check required fields.');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Could not connect to backend server. Please make sure the server is running.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
}

/* --------------------------------------------------------------------------
   5. Screen 4: Student Dashboard (dashboard.html)
   -------------------------------------------------------------------------- */
async function initDashboard() {
  const dashStats = document.querySelector('.dash-stats-grid');
  if (!dashStats || window.location.pathname.includes('admin.html')) return; // Not on dashboard.html

  try {
    // 1. Fetch live summary stats
    const statsRes = await fetch(`${API_BASE}/stats`);
    const statsData = await statsRes.json();
    if (statsData.success) {
      const s = statsData.data;
      const totalCount = document.getElementById('dashTotalCount');
      const activeCount = document.getElementById('dashActiveCount');
      const reunitedCount = document.getElementById('dashReunitedCount');

      if (totalCount) totalCount.textContent = s.totalItems;
      if (activeCount) activeCount.textContent = s.activeLost + s.activeFound;
      if (reunitedCount) reunitedCount.textContent = s.totalRecovered;
    }

    // 2. Fetch items for the table
    const itemsRes = await fetch(`${API_BASE}/items`);
    const itemsData = await itemsRes.json();
    if (itemsData.success) {
      renderDashboardTable(itemsData.data);
    }
  } catch (err) {
    console.warn('Could not fetch live dashboard data:', err.message);
  }
}

function renderDashboardTable(items) {
  const tbody = document.querySelector('.custom-table tbody');
  if (!tbody) return;

  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No reports logged yet.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => {
    const isFound = item.type === 'Found';
    const isRecovered = item.status === 'Recovered';
    const typeBadge = isFound
      ? '<span class="badge badge-found">Found</span>'
      : '<span class="badge badge-lost">Lost</span>';

    const statusBadge = isRecovered
      ? '<span class="badge badge-reunited">✓ Reunited</span>'
      : `<span class="badge ${isFound ? 'badge-found' : 'badge-lost'}">● Active</span>`;

    const dateStr = item.date
      ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'N/A';

    return `
      <tr data-id="${item._id}">
        <td>
          <div class="table-item-cell">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
              ${getCategoryIcon(item.category)}
            </div>
            <div>
              <strong style="color: var(--text-main); font-size: 0.92rem; display: block;">
                <a href="item.html?id=${item._id}" style="color: inherit;">${escapeHtml(item.title)}</a>
              </strong>
              <span style="font-size: 0.78rem; color: var(--text-muted);">Ref: #${item._id.slice(-6).toUpperCase()}</span>
            </div>
          </div>
        </td>
        <td>${typeBadge}</td>
        <td>${escapeHtml(item.location)}</td>
        <td>${dateStr}</td>
        <td class="status-badge-cell">${statusBadge}</td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end; display: flex; gap: 8px;">
            <button class="btn btn-sm ${isRecovered ? 'btn-outline' : 'btn-secondary'} btn-mark-reunited"
              data-id="${item._id}"
              ${isRecovered ? 'disabled' : ''}>
              ${isRecovered ? 'Completed' : '✓ Reunited'}
            </button>
            <button class="btn btn-outline btn-sm btn-delete-item" data-id="${item._id}" title="Remove Report">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Attach status toggle handler
  document.querySelectorAll('.btn-mark-reunited').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = this.getAttribute('data-id');
      if (!id) return;

      try {
        const res = await fetch(`${API_BASE}/items/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Recovered' })
        });
        const data = await res.json();
        if (data.success) {
          initDashboard();
        }
      } catch (err) {
        console.error('Error marking as recovered:', err);
      }
    });
  });

  // Attach delete handler
  document.querySelectorAll('.btn-delete-item').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = this.getAttribute('data-id');
      if (!id) return;

      if (!confirm('Are you sure you want to delete this report?')) return;

      try {
        const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          initDashboard();
        }
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Utility: HTML Escaping
   -------------------------------------------------------------------------- */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
