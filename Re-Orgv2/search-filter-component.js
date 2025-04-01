// src/components/CenterPanel/SearchAndFilter.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  Typography,
  Divider,
  TextField,
  IconButton,
  Button,
  Collapse,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  InputAdornment,
  Chip,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { selectRolesByFactory } from '../../features/roleSlice';
import { selectPersonnelByFactory } from '../../features/personnelSlice';
import { selectCurrentFactory } from '../../features/focusFactorySlice';

const SearchAndFilter = ({
  open,
  onClose,
  onApplySearch,
  onApplyFilters,
  onClearSearch,
  onClearFilters,
  currentSearch = ''
}) => {
  const currentFactory = useSelector(selectCurrentFactory);
  const roles = useSelector(state => selectRolesByFactory(state, currentFactory));
  const personnel = useSelector(state => selectPersonnelByFactory(state, currentFactory));
  
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [expandedFilters, setExpandedFilters] = useState(true);
  const [expandedSavedSearches, setExpandedSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    departments: {},
    hasRoles: false,
    hasPersonnel: false,
    hasVacancies: false,
    experience: 'all'
  });

  // Extract all unique departments from roles
  const departments = [...new Set(roles.map(role => role.department).filter(Boolean))];
  
  // Extract all unique skills from roles and personnel
  const allSkills = new Set();
  roles.forEach(role => {
    if (role.skills) {
      role.skills.forEach(skill => allSkills.add(skill));
    }
  });
  personnel.forEach(person => {
    if (person.skills) {
      person.skills.forEach(skill => allSkills.add(skill));
    }
  });
  const skills = [...allSkills];
  
  // Selected skills for filtering
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  useEffect(() => {
    // Initialize department filters
    const deptFilters = {};
    departments.forEach(dept => {
      deptFilters[dept] = false;
    });
    setFilters(prev => ({
      ...prev,
      departments: deptFilters
    }));
    
    // Load saved searches from localStorage
    const savedSearchesString = localStorage.getItem('savedSearches');
    if (savedSearchesString) {
      try {
        setSavedSearches(JSON.parse(savedSearchesString));
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    }
  }, [departments]);
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleApplySearch = () => {
    onApplySearch(searchTerm);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    onClearSearch();
  };
  
  const handleDepartmentFilterChange = (event) => {
    const { name, checked } = event.target;
    setFilters(prev => ({
      ...prev,
      departments: {
        ...prev.departments,
        [name]: checked
      }
    }));
  };
  
  const handleFilterChange = (event) => {
    const { name, checked, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value !== undefined ? value : checked
    }));
  };
  
  const handleSkillsChange = (event, newValue) => {
    setSelectedSkills(newValue);
  };
  
  const handleApplyFilters = () => {
    // Count active filters
    const activeFilters = {
      ...filters,
      selectedSkills: selectedSkills
    };
    onApplyFilters(activeFilters);
  };
  
  const handleClearFilters = () => {
    // Reset all filters
    const deptFilters = {};
    departments.forEach(dept => {
      deptFilters[dept] = false;
    });
    
    setFilters({
      departments: deptFilters,
      hasRoles: false,
      hasPersonnel: false,
      hasVacancies: false,
      experience: 'all'
    });
    
    setSelectedSkills([]);
    onClearFilters();
  };
  
  const handleSaveSearch = () => {
    const newSavedSearch = {
      id: Date.now().toString(),
      name: searchTerm || `Search ${savedSearches.length + 1}`,
      searchTerm: searchTerm,
      filters: filters,
      selectedSkills: selectedSkills,
      factory: currentFactory
    };
    
    const updatedSavedSearches = [...savedSearches, newSavedSearch];
    setSavedSearches(updatedSavedSearches);
    
    // Save to localStorage
    localStorage.setItem('savedSearches', JSON.stringify(updatedSavedSearches));
  };
  
  const handleLoadSavedSearch = (savedSearch) => {
    setSearchTerm(savedSearch.searchTerm || '');
    setFilters(savedSearch.filters || {
      departments: {},
      hasRoles: false,
      hasPersonnel: false,
      hasVacancies: false,
      experience: 'all'
    });
    setSelectedSkills(savedSearch.selectedSkills || []);
    
    // Apply the search and filters
    onApplySearch(savedSearch.searchTerm || '');
    onApplyFilters({
      ...savedSearch.filters,
      selectedSkills: savedSearch.selectedSkills || []
    });
  };
  
  const handleDeleteSavedSearch = (id) => {
    const updatedSavedSearches = savedSearches.filter(search => search.id !== id);
    setSavedSearches(updatedSavedSearches);
    
    // Save to localStorage
    localStorage.setItem('savedSearches', JSON.stringify(updatedSavedSearches));
  };
  
  const countActiveFilters = () => {
    let count = 0;
    
    // Count department filters
    Object.values(filters.departments).forEach(value => {
      if (value) count++;
    });
    
    // Count other checkbox filters
    if (filters.hasRoles) count++;
    if (filters.hasPersonnel) count++;
    if (filters.hasVacancies) count++;
    
    // Count experience filter if not 'all'
    if (filters.experience !== 'all') count++;
    
    // Count selected skills
    count += selectedSkills.length;
    
    return count;
  };
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <Box sx={{ width: 350, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Search & Filter
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Search Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Search
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Search positions, roles, or personnel..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 1 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleSaveSearch}
              startIcon={<BookmarkIcon />}
              disabled={!searchTerm && countActiveFilters() === 0}
            >
              Save
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleApplySearch}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Filters Section */}
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              mb: 1
            }}
            onClick={() => setExpandedFilters(!expandedFilters)}
          >
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} />
              Filters
              {countActiveFilters() > 0 && (
                <Chip 
                  size="small" 
                  label={countActiveFilters()} 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Typography>
            <IconButton size="small">
              {expandedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedFilters}>
            <Box sx={{ pl: 2 }}>
              {/* Department Filter */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Departments
              </Typography>
              <FormGroup>
                {departments.map(dept => (
                  <FormControlLabel
                    key={dept}
                    control={
                      <Checkbox 
                        checked={filters.departments[dept] || false} 
                        onChange={handleDepartmentFilterChange} 
                        name={dept} 
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{dept}</Typography>}
                  />
                ))}
              </FormGroup>
              
              {/* Assignment Filters */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Assignments
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={filters.hasRoles} 
                      onChange={handleFilterChange} 
                      name="hasRoles" 
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Has Roles Assigned</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={filters.hasPersonnel} 
                      onChange={handleFilterChange} 
                      name="hasPersonnel" 
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Has Personnel Assigned</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={filters.hasVacancies} 
                      onChange={handleFilterChange} 
                      name="hasVacancies" 
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Show Vacancies</Typography>}
                />
              </FormGroup>
              
              {/* Experience Filter */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Experience Level
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup 
                  name="experience" 
                  value={filters.experience}
                  onChange={handleFilterChange}
                >
                  <FormControlLabel value="all" control={<Radio size="small" />} label={<Typography variant="body2">All Levels</Typography>} />
                  <FormControlLabel value="entry" control={<Radio size="small" />} label={<Typography variant="body2">Entry Level</Typography>} />
                  <FormControlLabel value="mid" control={<Radio size="small" />} label={<Typography variant="body2">Mid Level</Typography>} />
                  <FormControlLabel value="senior" control={<Radio size="small" />} label={<Typography variant="body2">Senior Level</Typography>} />
                  <FormControlLabel value="leadership" control={<Radio size="small" />} label={<Typography variant="body2">Leadership</Typography>} />
                </RadioGroup>
              </FormControl>
              
              {/* Skills Filter */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Skills
              </Typography>
              <Autocomplete
                multiple
                id="skills-filter"
                options={skills}
                value={selectedSkills}
                onChange={handleSkillsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Select skills..."
                    size="small"
                  />
                )}
                size="small"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Saved Searches Section */}
        <Box>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              mb: 1
            }}
            onClick={() => setExpandedSavedSearches(!expandedSavedSearches)}
          >
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
              <BookmarkBorderIcon sx={{ mr: 1 }} />
              Saved Searches
              {savedSearches.length > 0 && (
                <Chip 
                  size="small" 
                  label={savedSearches.length} 
                  color="secondary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Typography>
            <IconButton size="small">
              {expandedSavedSearches ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSavedSearches}>
            {savedSearches.length > 0 ? (
              <List dense>
                {savedSearches.map(search => (
                  <ListItem
                    key={search.id}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        size="small"
                        onClick={() => handleDeleteSavedSearch(search.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    button
                    onClick={() => handleLoadSavedSearch(search)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <BookmarkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={search.name}
                      secondary={`${search.factory} - ${search.searchTerm || 'No search term'}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No saved searches yet. Use the Save button to save your searches and filters.
              </Typography>
            )}
          </Collapse>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SearchAndFilter;