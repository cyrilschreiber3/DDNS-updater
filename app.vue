<script setup>
import axios from 'axios';

const data = ref([]);
const showInvalidDomainLabel = ref(false);
const scriptBusy = ref(false);
const showOutputDialog = ref(false);
const outputMsg = ref('');

const formData = ref({ domainLabel: "", domainURL: "", domainProvider: "" });

onMounted(() => {
  getDomains();
  getProviders();
  getLastscriptRun();
});

const getDomains = () => {
  $fetch('/api/settings/show').then((res) => {
    data.value.domains = null;
    data.value.domains = res.data;
  });
};

const getProviders = () => {
  $fetch('/api/providers').then((res) => {
    data.value.providers = null;
    data.value.providers = res.data;
  });
};

const getLastscriptRun = () => {
  $fetch('/api/lastscriptrun').then((res) => {
    let dateFormat = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, });
    data.value.lastRun = null;
    if (res.data == 'Never') {
      data.value.lastRun = 'never';
      return;
    }
    data.value.lastRun = dateFormat.format(res.data);
  });
};

const runScript = () => {
  scriptBusy.value = true;
  showOutputDialog.value = true;
  outputMsg.value = '';

  axios.get('/api/runscript').then((res) => {
    outputMsg.value = res.data;
    scriptBusy.value = false;
  }).then(() => {
    getLastscriptRun();
  });
};

const addDomain = async () => {
  let newDomainLabel = formData.value.domainLabel;
  let newDomainURL = formData.value.domainURL;
  let newDomainProvider = formData.value.domainProvider;
  showInvalidDomainLabel.value = false

  if (!newDomainURL.match(/^(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}$/gim) || !newDomainLabel.match(/[a-z0-9]/gim)) {
    showInvalidDomainLabel.value = true
    return;
  }

  await axios.post('/api/settings/add', {
    name: newDomainLabel,
    url: newDomainURL,
    provider: newDomainProvider
  }).then((res) => {
    if (res.data.data.status == '200') {
      getDomains();
      formData.value.domainLabel = '';
      formData.value.domainURL = '';
      formData.value.domainProvider = '';
    } else {
      console.alert(res.data.data.message);
    }
  });

};

const deleteDomain = async (domain) => {
  await axios.post('/api/settings/delete', {
    name: domain.domain.name,
    url: domain.domain.url
  }).then((res) => {
    if (res.data.data.status == '200') {
      getDomains();
    } else {
      console.alert(res.data.data.message);
    }
  });
};

</script>

<template>
  <div class="flex flex-col flex-start min-h-screen bg-slate-900 text-center">
    <h1 class="font-bold pt-10 text-gray-300 text-4xl">DDNS Updater Configuration</h1>
    <Modal @close="showOutputDialog = false" title="Run the DDNS updater script manualy" v-show="showOutputDialog"
      :busy="scriptBusy">
      <div class="flex flex-auto flex-col justify-center items-center w-full px-4 py-2 md:px-5">
        <Paragraph v-if="outputMsg == ''" class="self-start text-left mb-5">
          Wait for the script to finish running to see the output.
        </Paragraph>
        <Paragraph v-else class="self-start text-left mb-5">
          Script output:
        </Paragraph>
        <div v-show="scriptBusy" class="flex justify-center">
          <div
            class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
            role="status" aria-label="loading">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        <div v-if="outputMsg"
          class="whitespace-pre-line break-words text-left text-gray-200 rounded-2xl p-3 bg-gray-900">
          <pre>{{ JSON.stringify(outputMsg, null, 4) }}</pre>
        </div>
      </div>
    </Modal>
    <div class="flex my-12 justify-center items-center gap-4">
      <Paragraph>
        Last Update script run: {{ data.lastRun }}
      </Paragraph>
      <Button @click="runScript()" value="Run now" />
    </div>
    <div class="flex mb-4 justify-center">
      <Table>
        <template #header>
          <TableRow title="true">
            <TableTitleCell>Label</TableTitleCell>
            <TableTitleCell>Host</TableTitleCell>
            <TableTitleCell>Provider</TableTitleCell>
            <TableTitleCell class="text-right">Delete</TableTitleCell>
          </TableRow>
        </template>
        <template #content>
          <TableRow v-for="domain in data.domains" :key="domain.domain">
            <TableCell>{{ domain.name }}</TableCell>
            <TableCell><a :href="'https://' + domain.url" class="hover:underline">{{ domain.url }}</a></TableCell>
            <TableCell>{{ domain.provider }}</TableCell>
            <TableCell @click="deleteDomain({ domain })" class="text-right">
              <a class="text-blue-500 hover:text-blue-700 transition" href="#">Delete</a>
            </TableCell>
          </TableRow>
          <TableRow title="true">
            <TableCell>
              <Input placeholder="New Domain Label" v-model="formData.domainLabel" />
            </TableCell>
            <TableCell>
              <Input placeholder="New Domain" v-model="formData.domainURL" />
            </TableCell>
            <TableCell>
              <Select v-model="formData.domainProvider" placeholder="Provider">
                <option selected disabled hidden>Select a provider</option>
                <option v-for="provider in data.providers" :key="provider" :value="provider">{{ provider }}</option>
              </Select>
            </TableCell>
            <TableCell class="flex flex-row-reverse">
              <Button @click="addDomain()">Add</Button>
            </TableCell>
          </TableRow>
        </template>
      </Table>
    </div>
    <Paragraph>
      <div v-if="showInvalidDomainLabel" class="text-red-500">
        Invalid domain label or domain name.
      </div>
    </Paragraph>
  </div>
</template>