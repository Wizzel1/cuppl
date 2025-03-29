import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

export type OwnerAssignment = 'me' | 'partner' | 'us';

interface OwnerDropdownProps {
  onAssignedToChange: (assignedTo: OwnerAssignment) => void;
  selectedAssignedTo: OwnerAssignment;
}

function OwnerDropdown({ onAssignedToChange, selectedAssignedTo }: OwnerDropdownProps) {
  const [assignedTo, setAssignedTo] = useState<OwnerAssignment>(selectedAssignedTo);

  // Set initial owner text based on selectedAssignedTo
  const getOwnerText = (type: OwnerAssignment) => {
    switch (type) {
      case 'us':
        return 'Both of us';
      case 'partner':
        return 'Partner';
      case 'me':
        return 'Me';
      default:
        return 'Both of us';
    }
  };

  const [owner, setOwner] = useState(getOwnerText(selectedAssignedTo));

  useEffect(() => {
    setOwner(getOwnerText(assignedTo));
  }, [assignedTo]);

  return (
    <View style={styles.container}>
      <Text style={styles.ownerText}>Owner</Text>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <View style={styles.dropdownTrigger}>
            <Text style={styles.selectedOwnerText}>{owner}</Text>
          </View>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            key="me"
            onSelect={() => {
              onAssignedToChange('me');
              setAssignedTo('me');
            }}>
            <DropdownMenu.ItemTitle>Me</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key="us"
            onSelect={() => {
              onAssignedToChange('us');
              setAssignedTo('us');
            }}>
            <DropdownMenu.ItemTitle>Both</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key="partner"
            onSelect={() => {
              onAssignedToChange('partner');
              setAssignedTo('partner');
            }}>
            <DropdownMenu.ItemTitle>Partner</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerText: {
    fontSize: 16,
    color: '#27272A',
  },
  dropdownTrigger: {
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: 120,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
  },
  selectedOwnerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E51FF',
  },
});

export default memo(OwnerDropdown);
