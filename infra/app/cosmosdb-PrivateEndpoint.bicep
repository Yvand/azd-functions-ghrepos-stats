// Parameters
@description('Specifies the name of the virtual network.')
param virtualNetworkName string

@description('Specifies the name of the subnet which contains the virtual machine.')
param subnetName string

@description('Specifies the resource name of the cosmosdb resource with an endpoint.')
param resourceName string

@description('Specifies the location.')
param location string = resourceGroup().location

param tags object = {}

// Virtual Network
resource vnet 'Microsoft.Network/virtualNetworks@2021-08-01' existing = {
  name: virtualNetworkName
}

resource cosmosdbResource 'Microsoft.DocumentDB/databaseAccounts@2024-11-15' existing = {
  name: resourceName
}

var vaultPrivateDNSZoneName = 'privatelink.documents.azure.com'

// AVM module for vault Private DNS Zone
module privateDnsZoneVaultDeployment 'br/public:avm/res/network/private-dns-zone:0.7.1' = {
  name: 'cosmosdb-private-dns-zone-deployment'
  params: {
    name: vaultPrivateDNSZoneName
    location: 'global'
    tags: tags
    virtualNetworkLinks: [
      {
        name: '${resourceName}-cosmosdb-link-${take(toLower(uniqueString(resourceName, virtualNetworkName)), 4)}'
        virtualNetworkResourceId: vnet.id
        registrationEnabled: false
        location: 'global'
        tags: tags
      }
    ]
  }
}

// AVM module for Blob Private Endpoint with private DNS zone
module cosmosdbPrivateEndpoint 'br/public:avm/res/network/private-endpoint:0.11.0' = {
  name: 'private-endpoint-cosmosdb-deployment'
  params: {
    name: 'private-endpoint-cosmosdb'
    location: location
    tags: tags
    subnetResourceId: '${vnet.id}/subnets/${subnetName}'
    privateLinkServiceConnections: [
      {
        name: 'pl-cosmosdb'
        properties: {
          privateLinkServiceId: cosmosdbResource.id
          groupIds: [
            'Sql'
          ]
        }
      }
    ]
    customDnsConfigs: []
    // Creates private DNS zone and links
    privateDnsZoneGroup: {
      name: 'cosmosdbPrivateDnsZoneGroup'
      privateDnsZoneGroupConfigs: [
        {
          name: 'cosmosdbARecord'
          privateDnsZoneResourceId: privateDnsZoneVaultDeployment.outputs.resourceId
        }
      ]
    }
  }
}
