const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const {Pool} = require('pg');
// const bcrypt=require('bcrypt');
// const jwt = require('jsonwebtoken');
// const User = require('./models/user');
// const sequelize = require('./db');
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

// Loading the clustered JSON data
const hospitalsClustered = JSON.parse(fs.readFileSync(path.join(__dirname, 'views', 'hospitals_clustered.json')));
const fireStationsClustered = JSON.parse(fs.readFileSync(path.join(__dirname, 'views', 'fire_stations_clustered.json')));
const fireIncidentsClustered = JSON.parse(fs.readFileSync(path.join(__dirname, 'views', 'fire_incidents_clustered.json')));

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

        // Fetch data from the database
        const hospitalsResult = await client.query('SELECT * FROM public.hospitals');
        const fireStationsResult = await client.query('SELECT * FROM public.firestations');
        const fireIncidentsResult = await client.query('SELECT * FROM public.fireincident');

        const hospitals = hospitalsResult.rows.map(row => {
            const clusterInfo = hospitalsClustered.find(h => h.HospitalNo === row.HospitalNo);
            return {
                Name: row.Name,
                HospitalNo: row.HospitalNo,
                latitude: row.latitude,
                longitude: row.longitude,
                type: 'hospital',
                cluster: clusterInfo ? clusterInfo.cluster : null // cluster info
            };
        });

        const fireStations = fireStationsResult.rows.map(row => {
            const clusterInfo = fireStationsClustered.find(s => s.StationID === row.StationID);
            return {
                StationID: row.StationID,
                latitude: row.latitude,
                longitude: row.longitude,
                type: 'fire_station',
                cluster: clusterInfo ? clusterInfo.cluster : null // cluster info
            };
        });

        const fireIncidents = fireIncidentsResult.rows.map(row => {
            const clusterInfo = fireIncidentsClustered.find(i => i.incidentId === row.incidentId);
            return {
                incidentId: row.incidentId,
                date: row.date,
                latitude: row.latitude,
                longitude: row.longitude,
                type: 'fire_incident',
                cluster: clusterInfo ? clusterInfo.cluster : null // cluster info
            };
        });

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
