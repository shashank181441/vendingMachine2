document.getElementById('show-toast').addEventListener('click', () => {
    const toast = document.getElementById('toast');
    
    // Show the toast
    toast.classList.add('show');
    
    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // 3000 milliseconds = 3 seconds
});
