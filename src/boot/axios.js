import Vue from 'vue'
import axios from 'axios'
import store from '../store/module'

// axios.defaults.baseURL = "http://150.136.160.71:7004/soa-infra/resources"
axios.defaults.baseURL = "https://p5echqud2mlp6toz6oejdtjm3e.apigateway.us-ashburn-1.oci.customer-oci.com/hanjin/soa/"

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.get["Content-Type"] = "application/json";

Vue.prototype.$axios = axios
