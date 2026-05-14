// Wait for auth to finish, then fetch dashboard data
async function initDashboard() {
    await requireAuth();
    if (businessId) {
        fetchData();
    }
}

// Start initialization when page loads
document.addEventListener("DOMContentLoaded", initDashboard);

async function fetchData() {
    const loader = document.getElementById("loader");
    const content = document.getElementById("dashboardContent");
    const leadsBody = document.getElementById("leadsBody");

    loader.style.display = "block";
    content.style.opacity = "0.5";

    try {
        // Fetch contacts for THIS business only
        const { data: contactsData, error } = await supabaseClient
            .from('contacts')
            .select('*')
            .eq('business_id', businessId)
            .order('last_seen', { ascending: false });

        if (error) throw error;

        // Calculate stats
        const totalLeads = contactsData ? contactsData.length : 0;
        let totalMsgs = 0;
        let activeChats = 0;

        if (contactsData) {
            contactsData.forEach(c => {
                totalMsgs += (c.message_count || 0);
                const lastSeen = new Date(c.last_seen);
                const hoursSince = (new Date() - lastSeen) / (1000 * 60 * 60);
                if (hoursSince < 24) activeChats++;
            });
        }

        // Update Overview Cards
        document.getElementById("valLeads").innerText = totalLeads;
        document.getElementById("valActiveChats").innerText = activeChats;
        document.getElementById("valTotalMsgs").innerText = totalMsgs;

        // Update Table
        leadsBody.innerHTML = "";

        if (contactsData && contactsData.length > 0) {
            contactsData.forEach(contact => {
                const tr = document.createElement("tr");

                const phone = contact.phone_number;
                const name = contact.name || "<span style='color:#64748b;font-style:italic;'>Unknown</span>";
                const msgs = contact.message_count;

                const firstContact = new Date(contact.first_seen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                const lastActive = new Date(contact.last_seen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

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
                leadsBody.appendChild(tr);
            });
        } else {
            leadsBody.innerHTML = `<tr><td colspan="6" class="empty-state">No leads captured yet. Your AI is waiting for messages!</td></tr>`;
        }

        loader.style.display = "none";
        content.style.display = "block";
        content.style.opacity = "1";

    } catch (error) {
        console.error("Dashboard error:", error);
        // Show empty state instead of error popup for new businesses
        leadsBody.innerHTML = `<tr><td colspan="6" class="empty-state">No leads captured yet. Your AI is waiting for messages!</td></tr>`;
        document.getElementById("valLeads").innerText = 0;
        document.getElementById("valActiveChats").innerText = 0;
        document.getElementById("valTotalMsgs").innerText = 0;
        loader.style.display = "none";
        content.style.display = "block";
        content.style.opacity = "1";
    }
}
