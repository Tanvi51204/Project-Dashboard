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

app.get('/', async (req, res) => {
    try {
        const client = await pool.connect();

        
        const hospitalsResult = await client.query('SELECT * FROM public.hospitals');
        const fireStationsResult = await client.query('SELECT * FROM public.firestations');
        const fireIncidentsResult = await client.query('SELECT * FROM public.fireincident');

        
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

        
        const combinedData = [...hospitals, ...fireStations, ...fireIncidents];

        client.release();

        
        res.render('map', { locations: combinedData });
        
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/addLoc', (req, res) => {
    const {sql, values} = req.body;

    
    pool.query(sql, values, 
               (error, results) => {
        if (error) {
            console.error('Error inserting location:', error);
            res.status(500).send('Error inserting location');
        } else {
            res.redirect('map.ejs');
            console.log('Location added successfully');
            
        }
    });
});





app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
