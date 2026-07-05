// ==================== WELCOME BANNER ====================
function updateWelcomeBanner() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';

    const greetingEl = document.getElementById('welcomeGreeting');
    if (greetingEl) {
        const brandEl = document.querySelector('.brand');
        const bizName = brandEl ? brandEl.textContent.trim() : '';
        greetingEl.innerHTML = `${greeting}${bizName ? ', ' + bizName : ''} <span class="wave-emoji">👋</span>`;
    }

    const timeEl = document.getElementById('welcomeTime');
    if (timeEl) {
        const now = new Date();
        const timeStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        timeEl.querySelector('span').textContent = timeStr;
    }
}

// ==================== ANIMATED COUNT-UP ====================
function animateCountUp(element, target, suffix = '') {
    if (!element) return;
    const duration = 800;
    const start = 0;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);
        element.textContent = current.toLocaleString() + suffix;
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.classList.add('counting');
            setTimeout(() => element.classList.remove('counting'), 300);
        }
    }
    requestAnimationFrame(step);
}

// ==================== SECTION FADE-IN ====================
const originalShowSection = window.showSection;
if (typeof originalShowSection === 'function') {
    window.showSection = function(sectionId, el) {
        originalShowSection(sectionId, el);
        // Apply fade-in to the newly visible section
        const sections = document.querySelectorAll('.section, .main-content:first-of-type');
        sections.forEach(s => {
            if (s.style.display !== 'none' && s.offsetParent !== null) {
                s.classList.remove('section-fade-in');
                void s.offsetWidth; // Trigger reflow
                s.classList.add('section-fade-in');
            }
        });
    };
}

// ==================== DASHBOARD INIT ====================
async function initDashboard() {
    await requireAuth();
    if (businessId) {
        updateWelcomeBanner();
        fetchData();
    }
}

// Start initialization when page loads
document.addEventListener("DOMContentLoaded", initDashboard);

async function fetchData() {
    const loader = document.getElementById("loader");
    const content = document.getElementById("dashboardContent");
    const leadsBody = document.getElementById("leadsBody");
    const statsGrid = document.querySelector(".stats-grid-4");

    // Show skeleton loaders instead of dimming content
    loader.style.display = "none";
    content.style.display = "block";
    content.style.opacity = "1";

    // Skeleton cards for stats (4 cards now)
    if (statsGrid) {
        statsGrid.innerHTML = `
            <div class="skeleton-card"><div class="skeleton skeleton-icon"></div><div class="skeleton skeleton-value"></div><div class="skeleton skeleton-label"></div></div>
            <div class="skeleton-card"><div class="skeleton skeleton-icon"></div><div class="skeleton skeleton-value"></div><div class="skeleton skeleton-label"></div></div>
            <div class="skeleton-card"><div class="skeleton skeleton-icon"></div><div class="skeleton skeleton-value"></div><div class="skeleton skeleton-label"></div></div>
            <div class="skeleton-card"><div class="skeleton skeleton-icon"></div><div class="skeleton skeleton-value"></div><div class="skeleton skeleton-label"></div></div>
        `;
    }

    // Skeleton rows for leads table
    if (leadsBody) {
        leadsBody.innerHTML = Array.from({ length: 5 }, () => `
            <tr class="skeleton-row">
                <td><div class="skeleton skeleton-cell" style="width:120px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:90px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:40px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:100px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:100px"></div></td>
                <td><div class="skeleton skeleton-cell" style="width:60px"></div></td>
            </tr>
        `).join('');
    }

    try {
        // Fetch contacts for THIS business only
        const { data: contactsData, error } = await supabaseClient
            .from('contacts')
            .select('*')
            .eq('business_id', businessId)
            .order('last_seen', { ascending: false })
            .limit(100);

        if (error) throw error;

        // Fetch orders count for conversion rate
        let totalOrders = 0;
        let pendingOrders = 0;
        try {
            const { data: ordersData } = await supabaseClient
                .from('orders')
                .select('id, status')
                .eq('business_id', businessId);
            if (ordersData) {
                totalOrders = ordersData.length;
                pendingOrders = ordersData.filter(o => (o.status || '').toLowerCase() === 'pending').length;
            }
        } catch(e) { /* orders table may not exist yet */ }

        // Calculate stats
        const totalLeads = contactsData ? contactsData.length : 0;
        let totalMsgs = 0;
        let activeChats = 0;
        let todayLeads = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (contactsData) {
            contactsData.forEach(c => {
                totalMsgs += (c.message_count || 0);
                const lastSeen = new Date(c.last_seen);
                const hoursSince = (new Date() - lastSeen) / (1000 * 60 * 60);
                if (hoursSince < 24) activeChats++;
                if (new Date(c.first_seen) >= today) todayLeads++;
            });
        }

        // Conversion rate: orders / leads * 100
        const conversionRate = totalLeads > 0 ? Math.round((totalOrders / totalLeads) * 100) : 0;

        // Restore real stat cards (replacing skeletons)
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon icon-blue"><i class="fa-solid fa-users"></i></div>
                    <div class="stat-value" id="valLeads">0</div>
                    <div class="stat-label">Total Leads</div>
                    <div class="stat-trend ${todayLeads > 0 ? 'up' : 'neutral'}" id="trendLeads">
                        <i class="fa-solid fa-${todayLeads > 0 ? 'arrow-up' : 'minus'}"></i> ${todayLeads > 0 ? '+' + todayLeads + ' today' : 'No new today'}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon icon-purple"><i class="fa-solid fa-message"></i></div>
                    <div class="stat-value" id="valActiveChats">0</div>
                    <div class="stat-label">Active Chats</div>
                    <div class="stat-trend ${activeChats > 0 ? 'up' : 'neutral'}" id="trendChats">
                        <i class="fa-solid fa-${activeChats > 0 ? 'arrow-up' : 'minus'}"></i> ${activeChats > 0 ? activeChats + ' in last 24h' : 'No activity'}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon icon-green"><i class="fa-regular fa-paper-plane"></i></div>
                    <div class="stat-value" id="valTotalMsgs">0</div>
                    <div class="stat-label">Total Messages</div>
                    <div class="stat-trend neutral" id="trendMsgs">
                        <i class="fa-solid fa-minus"></i> All time
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon icon-amber"><i class="fa-solid fa-chart-simple"></i></div>
                    <div class="stat-value" id="valConversion">0%</div>
                    <div class="stat-label">Conversion Rate</div>
                    <div class="stat-trend ${conversionRate > 0 ? 'up' : 'neutral'}" id="trendConversion">
                        <i class="fa-solid fa-${conversionRate > 0 ? 'arrow-up' : 'minus'}"></i> ${totalOrders} orders from ${totalLeads} leads
                    </div>
                </div>
            `;
        }

        // Animate count-up for each stat
        animateCountUp(document.getElementById('valLeads'), totalLeads);
        animateCountUp(document.getElementById('valActiveChats'), activeChats);
        animateCountUp(document.getElementById('valTotalMsgs'), totalMsgs);
        animateCountUp(document.getElementById('valConversion'), conversionRate, '%');

        // Update welcome banner summary
        const welcomeLeads = document.getElementById('welcomeLeads');
        const welcomeOrders = document.getElementById('welcomeOrders');
        if (welcomeLeads) welcomeLeads.textContent = todayLeads;
        if (welcomeOrders) welcomeOrders.textContent = pendingOrders;

        // Update Table Headers dynamically based on bot mode
        const leadsHead = document.querySelector("#leadsTable thead");
        if (leadsHead) {
            if (currentMode === 'real_estate') {
                leadsHead.innerHTML = `
                    <tr>
                        <th>Phone Number</th>
                        <th>Name</th>
                        <th>Budget Range</th>
                        <th>Preferred Location</th>
                        <th>Last Active</th>
                        <th>Status</th>
                    </tr>
                `;
            } else {
                leadsHead.innerHTML = `
                    <tr>
                        <th>Phone Number</th>
                        <th>Name</th>
                        <th>Total Messages</th>
                        <th>First Contact</th>
                        <th>Last Active</th>
                        <th>Status</th>
                    </tr>
                `;
            }
        }

        // Update Table Body
        leadsBody.innerHTML = "";

        if (contactsData && contactsData.length > 0) {
            contactsData.forEach(contact => {
                const tr = document.createElement("tr");

                const phone = contact.phone_number;
                const name = contact.name || "<span style='color:#64748b;font-style:italic;'>Unknown</span>";
                const msgs = contact.message_count;

                const firstContact = new Date(contact.first_seen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                const lastActive = new Date(contact.last_seen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                if (currentMode === 'real_estate') {
                    const budgetMin = contact.budget_min || "";
                    const budgetMax = contact.budget_max || "";
                    let budgetStr = "<span style='color:#64748b;font-style:italic;'>Unspecified</span>";
                    if (budgetMin && budgetMax) {
                        budgetStr = `${budgetMin} - ${budgetMax}`;
                    } else if (budgetMin || budgetMax) {
                        budgetStr = budgetMin || budgetMax;
                    }
                    const location = contact.preferred_location || "<span style='color:#64748b;font-style:italic;'>Unspecified</span>";
                    const searchStatus = contact.search_status || "searching";
                    
                    let statusBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">Searching</span>`;
                    if (searchStatus === 'viewing') {
                        statusBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">Viewing</span>`;
                    } else if (searchStatus === 'closed') {
                        statusBadge = `<span class="badge" style="background: rgba(79, 172, 254, 0.1); color: #4facfe;">Closed</span>`;
                    }

                    tr.innerHTML = `
                        <td style="font-family: monospace; color:#94a3b8;">${phone}</td>
                        <td style="font-weight: 500;">${name}</td>
                        <td style="font-weight: 600; color: var(--primary-light);">${budgetStr}</td>
                        <td>${location}</td>
                        <td style="font-size: 0.85rem; color:#94a3b8;">${lastActive}</td>
                        <td>${statusBadge}</td>
                    `;
                } else {
                    let statusBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">Active</span>`;
                    if (msgs < 3) statusBadge = `<span class="badge" style="background: rgba(79, 172, 254, 0.1); color: #4facfe;">New Lead</span>`;

                    tr.innerHTML = `
                        <td style="font-family: monospace; color:#94a3b8;">${phone}</td>
                        <td style="font-weight: 500;">${name}</td>
                        <td>${msgs}</td>
                        <td style="font-size: 0.85rem; color:#94a3b8;">${firstContact}</td>
                        <td style="font-size: 0.85rem; color:#94a3b8;">${lastActive}</td>
                        <td>${statusBadge}</td>
                    `;
                }
                leadsBody.appendChild(tr);
            });
        } else {
            leadsBody.innerHTML = `<tr><td colspan="6" class="empty-state">No leads captured yet. Your AI is waiting for messages!</td></tr>`;
        }

        loader.style.display = "none";
        content.style.display = "block";
        content.style.opacity = "1";
        
        // Render daily leads & message analytics chart
        renderAnalyticsChart();

    } catch (error) {
        console.error("Dashboard error:", error);
        // Show empty state instead of error popup for new businesses
        leadsBody.innerHTML = `<tr><td colspan="6" class="empty-state">No leads captured yet. Your AI is waiting for messages!</td></tr>`;
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon icon-blue"><i class="fa-solid fa-users"></i></div>
                    <div class="stat-value" id="valLeads">0</div>
                    <div class="stat-label">Total Leads</div>
                    <div class="stat-trend neutral"><i class="fa-solid fa-minus"></i> --</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon icon-purple"><i class="fa-solid fa-message"></i></div>
                    <div class="stat-value" id="valActiveChats">0</div>
                    <div class="stat-label">Active Chats</div>
                    <div class="stat-trend neutral"><i class="fa-solid fa-minus"></i> --</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon icon-green"><i class="fa-regular fa-paper-plane"></i></div>
                    <div class="stat-value" id="valTotalMsgs">0</div>
                    <div class="stat-label">Total Messages</div>
                    <div class="stat-trend neutral"><i class="fa-solid fa-minus"></i> --</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon icon-amber"><i class="fa-solid fa-chart-simple"></i></div>
                    <div class="stat-value" id="valConversion">0%</div>
                    <div class="stat-label">Conversion Rate</div>
                    <div class="stat-trend neutral"><i class="fa-solid fa-minus"></i> --</div>
                </div>
            `;
        }
        loader.style.display = "none";
        content.style.display = "block";
        content.style.opacity = "1";
    }
}

let analyticsChartInstance = null;

async function renderAnalyticsChart() {
    try {
        const res = await fetch(`${API_BASE}/stats/daily?business_id=${businessId}`);
        const data = await res.json();
        
        const canvas = document.getElementById('analyticsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (analyticsChartInstance) {
            analyticsChartInstance.destroy();
        }
        
        analyticsChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dates || [],
                datasets: [
                    {
                        label: 'New Leads Captured',
                        data: data.leads || [],
                        borderColor: '#4facfe',
                        backgroundColor: 'rgba(79, 172, 254, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#4facfe',
                        pointHoverRadius: 6,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Messages Exchanged',
                        data: data.messages || [],
                        borderColor: '#a855f7',
                        backgroundColor: 'rgba(168, 85, 247, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointBackgroundColor: '#a855f7',
                        pointHoverRadius: 5,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        padding: 10
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.03)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter' } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.03)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter' }, precision: 0 }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Failed to render analytics chart:", e);
    }
}
