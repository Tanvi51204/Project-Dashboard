const express = require('express');
const bodyParser = require('body-parser');
const {Pool} = require('pg');
const router = express.Router();
const app=express();
const port=3000;

app.use(bodyParser.json());
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const pool= new Pool(
    {
        user: 'postgres',
        host: 'localhost',
        database: 'ProjectFire',
        password: '1234',
        port: 5432,
    }
);
pool.connect();

//not being used 👇🏻
app.get('/test', async (req, res) => {
    try {
        // Execute the test query
        const query = 'SELECT * FROM public.hospitals LIMIT 5';
        const result = await pool.query(query);

        // Send the query result as a response
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing test query:', error);
        res.status(500).send('Internal server error');
    }
});


app.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM public.fireincident'); 
        const locations = result.rows;
        client.release();

        // Render the map HTML page and pass the location data to it
        res.render('fireincident', { locations });
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/hospitals', async(req,res)=>{
    try{
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM public.hospitals'); 
        const locations = result.rows;
        client.release();
        res.render('hospitals', { locations });
        
    } catch(error){
        console.error('Error fetching data from database',error);
        res.status(500).send('Internal server error');
    }
})
app.get('/fireincident', async(req,res)=>{
    try{
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM public.fireincident'); 
        const locations = result.rows;
        client.release();
        res.render('fireincident', { locations });
        
    } catch(error){
        console.error('Error fetching data from database',error);
        res.status(500).send('Internal server error');
    }
})
app.get('/firestation', async(req,res)=>{
    try{
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM public.firestations'); 
        const locations = result.rows;
        client.release();
        res.render('firestation', { locations });
        
    } catch(error){
        console.error('Error fetching data from database',error);
        res.status(500).send('Internal server error');
    }
})

app.get('/map', async (req, res) => {
    try {
        const client = await pool.connect();

        // Query data from each table
        const hospitalsResult = await client.query('SELECT * FROM public.hospitals');
        const fireStationsResult = await client.query('SELECT * FROM public.firestations');
        const fireIncidentsResult = await client.query('SELECT * FROM public.fireincident');

        // Combine data into a single dataset
        const hospitals = hospitalsResult.rows.map(row => ({
            Name: row.Name,
            HospitalNo : row.HospitalNo,
            latitude: row.latitude,
            longitude: row.longitude,
            type: 'hospital'
        }));

        const fireStations = fireStationsResult.rows.map(row => ({
        StationID: row.StationID,
            latitude: row.latitude,
            longitude: row.longitude,
            type: 'fire_station'
        }));

        const fireIncidents = fireIncidentsResult.rows.map(row => ({
            incidentId: row.incidentId,
            date: row.date,
            latitude: row.latitude,
            longitude: row.longitude,
            type: 'fire_incident'
        }));

        // Combine all datasets into a single array
        const combinedData = [...hospitals, ...fireStations, ...fireIncidents];

        client.release();

        // Render the map.ejs view and pass the combined data to it
        res.render('map', { locations: combinedData });
        
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/addLoc', (req, res) => {
    const {sql, values} = req.body;

    // Insert data into the database
    pool.query(sql, values, 
               (error, results) => {
        if (error) {
            console.error('Error inserting location:', error);
            res.status(500).send('Error inserting location');
        } else {
            res.redirect('map.ejs');
            console.log('Location added successfully');
            //res.status(200).send('Location added successfully');
        }
    });
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
