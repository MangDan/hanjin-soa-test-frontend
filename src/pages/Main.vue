<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-12 q-pa-sm">
        <div class="row">
          <div class="col q-pa-sm">
            <q-input
              v-model="serviceURI"
              outlined
              label="Service URI"
              dense
              style="width:70%"
            >
              <template v-slot:append>
                <q-icon
                  name="close"
                  @click="serviceURI = ''"
                  class="cursor-pointer"
                />
              </template>
              <template v-slot:append>
                <q-icon
                  v-if="serviceURI !== ''"
                  name="close"
                  @click="serviceURI = ''"
                  class="cursor-pointer"
                />
              </template>
              <template v-slot:after>
                <q-btn round dense flat icon="send" @click="listUsers" />
              </template>
            </q-input>
          </div>
          <div class="col q-pa-sm text-right">
            <q-btn
              outline
              color="primary"
              label="New"
              @click="openUserFormDialog('new', null)"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="row q-mt-xm">
      <div class="col-12">
        <div class="q-pa-md">
          <q-table
            :data="users"
            :columns="usersColumns"
            row-key="name"
            :loading="loading"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
                <q-th auto-width />
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.value }}
                </q-td>
                <q-td auto-width>
                  <q-btn
                    flat
                    round
                    @click="openUserFormDialog('delete', props)"
                    icon="mdi-trash-can-outline"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>
    </div>
    <q-dialog v-model="userFormDialog">
      <q-card style="min-width:500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ userFormDialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" @reset="onReset">
            <div class="row">
              <div class="col-12">
                <q-input
                  dense
                  outlined
                  v-model="user.name"
                  label="Your name *"
                  lazy-rules
                  :rules="[
                    val => (val && val.length > 0) || 'Please type something'
                  ]"
                />
              </div>
              <div class="col-6 q-pr-xs">
                <q-input
                  dense
                  outlined
                  type="number"
                  v-model="user.age"
                  label="Your age *"
                  lazy-rules
                  :rules="[
                    val =>
                      (val !== null && val !== '') || 'Please type your age',
                    val => (val > 0 && val < 100) || 'Please type a real age'
                  ]"
                />
              </div>
              <div class="col-6 q-pl-xs">
                <q-select
                  dense
                  outlined
                  v-model="user.gender"
                  :options="['M', 'F']"
                  label="Gender"
                  lazy-rules
                  :rules="[
                    val =>
                      (val !== null && val !== '') ||
                      'Please select your gender'
                  ]"
                />
              </div>
              <div class="col-12">
                <q-input
                  dense
                  outlined
                  v-model="user.email"
                  label="Your email*"
                  lazy-rules
                  :rules="emailRules"
                />
              </div>
            </div>
            <div class="text-right">
              <q-btn
                label="Submit"
                type="submit"
                color="primary"
                flat
                class="q-ml-sm"
              />
              <q-btn
                label="Reset"
                type="reset"
                color="primary"
                flat
                class="q-ml-sm"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="deleteConfirmDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="signal_wifi_off" color="primary" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this row?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Delete" color="primary" @click="onDelete" />
          <q-btn flat label="Cancel" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    // serviceURI: "default/REST2DBInsert/empselect?name=%25",
    serviceURI: null,
    userFormDialog: false,
    userFormDialogTitle: "New User",
    deleteConfirmDialog: false,
    loading: false,
    emailRules: [
      v => !!v || "E-mail is required",
      v => /.+@.+\..+/.test(v) || "E-mail must be valid"
    ],
    user: {
      name: null,
      age: null,
      email: null,
      gender: null
    },
    usersColumns: [
      {
        name: "name",
        required: true,
        label: "Name",
        field: "name",
        align: "left",
        sortable: true
      },
      {
        name: "age",
        align: "center",
        label: "Age",
        field: "age",
        sortable: false
      },
      {
        name: "email",
        align: "center",
        label: "Email",
        field: "email",
        sortable: false
      },
      {
        name: "gender",
        align: "right",
        label: "Gender",
        field: "gender",
        sortable: true
      },
      {
        name: "meal",
        align: "center",
        label: "Favoriate Meal",
        field: "meal",
        sortable: false
      }
    ],
    users: [],
    deletedIndex: -1
  }),
  created() {
    if (this.serviceURI !== null) this.listUsers();
  },
  mounted() {
    this.$axios.interceptors.request.use(
      config => {
        this.loading = true;
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    this.$axios.interceptors.response.use(
      response => {
        this.loading = false;
        return response;
      },
      error => {
        return Promise.reject(error);
      }
    );
    // this.$store.commit("module/LOADING", "data");
  },
  methods: {
    listUsers() {
      this.$axios
        .get(this.serviceURI)
        .then(response => {
          this.users = response.data.EmpList;
          // loading
        })
        .catch(error => {
          this.loading = false;
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Loading failed",
            icon: "report_problem"
          });
        });
    },
    openUserFormDialog(mode, props) {
      if (mode === "update") {
        this.userFormDialogTitle = "Update User";
        this.user = Object.assign({}, props.row);
        this.userFormDialog = true;
      } else if (mode === "delete") {
        this.deletedIndex = this.users.indexOf(props.row);
        this.user = Object.assign({}, props.row);
        this.deleteConfirmDialog = true;
      } else {
        this.onReset();
        this.userFormDialogTitle = "New User";
        this.userFormDialog = true;
      }
    },
    onSubmit() {
      this.$axios({
        method: "post",
        url: "default/REST2DBInsert/empservice",
        data: this.user
      })
        .then(result => {
          this.users.push(this.user);
          this.userFormDialog = false;
        })
        .catch(error => {
          this.loading = false;
          this.userFormDialog = false;
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Loading failed",
            icon: "report_problem"
          });
        });
    },
    onReset() {
      this.user.name = null;
      this.user.age = null;
      this.user.email = null;
      this.user.gender = null;
    },
    onDelete() {
      this.$axios({
        method: "delete",
        url: "default/REST2DBInsert/empdelete?name=" + this.user.name
      })
        .then(result => {
          this.users.splice(this.deletedIndex, 1);
          this.deleteConfirmDialog = false;
        })
        .catch(error => {
          this.loading = false;
          this.userFormDialog = false;
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Loading failed",
            icon: "report_problem"
          });
        });
    }
  }
};
</script>
