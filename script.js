
// ==========================================
// SUPABASE CONFIGURATION
// Replace these with your actual project details
// ==========================================

const SUPABASE_URL = "https://waberzwmmjtyuhhwtktb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_pf_JHZMlPedOUxfxzVH8fw_AWaJcQzH";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// ==========================================
// HTML ELEMENTS
// ==========================================

const form = document.getElementById("bookingForm");
const result = document.getElementById("bookingResult");
const dateInput = document.getElementById("date");

// Footer year
document.getElementById("year").textContent =
    new Date().getFullYear();

// ==========================================
// LOCAL DATE
// ==========================================

function getLocalDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Prevent selecting past dates
dateInput.min = getLocalDate();

// ==========================================
// SERVICE CARD SELECTION
// ==========================================

document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
        document.getElementById("service").value =
            link.dataset.service;
    });
});

// ==========================================
// APPOINTMENT FORM SUBMISSION
// ==========================================

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    result.hidden = false;
    result.classList.remove("error");

    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    const patientName = document
        .getElementById("patientName")
        .value.trim();

    const phone = document
        .getElementById("phone")
        .value.trim();

    const service = document
        .getElementById("service")
        .value;

    const appointmentDate = dateInput.value;

    const appointmentTime = document
        .getElementById("time")
        .value;

    const message = document
        .getElementById("message")
        .value.trim();

    // Required fields
    if (
        !patientName ||
        !phone ||
        !service ||
        !appointmentDate ||
        !appointmentTime
    ) {
        result.textContent =
            "Please complete all required fields.";

        result.classList.add("error");
        return;
    }

    // Phone validation
    if (!/^[+\d\s()-]{7,20}$/.test(phone)) {
        result.textContent =
            "Please enter a valid phone number.";

        result.classList.add("error");
        document.getElementById("phone").focus();
        return;
    }

    // Date validation
    if (appointmentDate < getLocalDate()) {
        result.textContent =
            "Please choose today or a future date.";

        result.classList.add("error");
        dateInput.focus();
        return;
    }

    // Prevent duplicate clicks
    if (submitButton) {
        submitButton.disabled = true;
    }

    result.textContent =
        "Submitting your appointment request...";

    try {
        const { data, error } = await supabaseClient
            .from("appointments")
            .insert([
                {
                    patient_name: patientName,
                    phone: phone,
                    service: service,
                    appointment_date: appointmentDate,
                    appointment_time: appointmentTime,
                    message: message || null
                }
            ])
            
            

        if (error) {
            console.error(
                "Appointment submission error:",
                error.message
            );

            result.textContent =
                "We couldn't submit your request. Please try again later.";

            result.classList.add("error");
            return;
        }

        result.textContent =
            "Your appointment request has been submitted successfully! The clinic team will contact you to confirm your appointment.";

        form.reset();

        dateInput.min = getLocalDate();

        result.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    } catch (error) {
        console.error("Unexpected error:", error);

        result.textContent =
            "Something went wrong. Please try again later.";

        result.classList.add("error");

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
});

