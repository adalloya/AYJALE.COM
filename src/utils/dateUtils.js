export const formatFriendlyDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    // Reset time components to compare only dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = today - compareDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Hoy';
    } else if (diffDays === 1) {
        return 'Ayer';
    } else if (diffDays > 1) {
        return `Hace ${diffDays} días`;
    } else {
        // Future dates (shouldn't happen for created_at, but just in case)
        return 'Hoy';
    }
};
