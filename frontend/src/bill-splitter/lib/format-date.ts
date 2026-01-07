export const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-AU", {
        dateStyle: "medium",
    }).format(new Date(dateStr));
};
