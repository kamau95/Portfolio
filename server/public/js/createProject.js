document.getElementById('projectForm').addEventListener('submit', async(e)=>{
    e.preventDefault();// Prevent default form submission

    const form= e.target;
    const formData= new FormData(form);

    try{
        const response= await fetch('/projects', {
            method: 'POST',
            body: formData
        });
        const responseData = await response.json(); // Parse response
        console.log('Response status:', response.status, 'Response data:', responseData);

        if(!response.ok){
            throw new Error(`Failed to create project: ${response.status}`); 
        }

        // Redirect to projects page on success
        window.location.href='/projects'
    }catch(err){
        console.error('Error', err);
        alert('unable to create projo, try again');
    }

})