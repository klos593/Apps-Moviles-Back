# Apps-Moviles-Back
## Get started

IMPORTANT!!
If you changed the port on the frontend you should also change it in **server.ts**

```
app.listen(3000 , () => { <-- replace 3000 with the port number used in the frontend
    console.log("Server is running on port 3000");
});
```

To start it run:
```
npm run dev
```
