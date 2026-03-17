// configuration
// Use your Render URL for the API endpoint
const API_URL = "https://salesflow-ai-bot.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});

async function fetchData() {
    const loader = document.getElementById("loader");
    const content = document.getElementById("dashboardContent");
    const leadsBody = document.getElementById("leadsBody");

    loader.style.display = "block";
    content.style.opacity = "0.5";

    try {
        // Fetch stats and contacts in parallel
        const [statsResponse, contactsResponse] = await Promise.all([
            fetch(`${API_URL}/stats`),
            fetch(`${API_URL}/contacts`)
        ]);

        if (!statsResponse.ok || !contactsResponse.ok) {
            throw new Error("Failed to fetch data from API. Ensure CORS is enabled on FastAPI.");
        }

        const statsData = await statsResponse.json();
        const contactsData = await contactsResponse.json();

        // Update Overview Cards
        document.getElementById("valLeads").innerText = statsData.total_contacts || 0;
        document.getElementById("valActiveChats").innerText = statsData.active_conversations || 0;
        document.getElementById("valTotalMsgs").innerText = statsData.total_messages || 0;

        // Update Table
        leadsBody.innerHTML = "";

        if (contactsData.contacts && contactsData.contacts.length > 0) {
            contactsData.contacts.forEach(contact => {
                const tr = document.createElement("tr");

                // Formulate the data
                const phone = contact.phone_number;
                const name = contact.name || "<span style='color:#64748b;font-style:italic;'>Unknown</span>";
                const msgs = contact.message_count;

                // Format dates safely
                const firstContact = new Date(contact.first_seen + 'Z').toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                const lastActive = new Date(contact.last_seen + 'Z').toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                // Basic status logic based on message count (just for UI flavor)
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
            leadsBody.innerHTML = `<tr><td colspan="6" class="empty-state">No leads captured yet. Send a message to the bot!</td></tr>`;
        }

        // Show Content
        loader.style.display = "none";
        content.style.display = "block";
        content.style.opacity = "1";

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        alert("Could not load dashboard data. Ensure the backend server is running and CORS is configured.");
        loader.style.display = "none";
        content.style.display = "block";
        content.style.opacity = "1";
    }
}
